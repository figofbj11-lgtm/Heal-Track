from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional
import os
import json
import shutil
from ai_pipeline import AIPipelineInstance

app = FastAPI(
    title="HealTrack AI - Cognitive Diagnostic Server",
    description="FastAPI computer vision pipeline hosting YOLOv8 and ResNet classification models for wound healing assessment.",
    version="1.0.0"
)

# CORS configuration for Flutter/Web client connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize dataset directory and programmatically generate synthetic default images
def init_dataset():
    dataset_dir = os.path.join(os.path.dirname(__file__), "dataset")
    if not os.path.exists(dataset_dir):
        os.makedirs(dataset_dir)
        
    metadata_path = os.path.join(dataset_dir, "metadata.json")
    
    defaults = [
        {
            "filename": "ref_healed.jpg",
            "status": "healed",
            "notes": "Healthy remodeling tissue, complete skin closure, clean scar line."
        },
        {
            "filename": "ref_healing.jpg",
            "status": "healing",
            "notes": "Granulating proliferative stage, stable recovery, normal redness."
        },
        {
            "filename": "ref_infected.jpg",
            "status": "infected",
            "notes": "High infection risk, yellow slough and active localized inflammation."
        }
    ]
    
    import cv2
    import numpy as np
    
    for item in defaults:
        filepath = os.path.join(dataset_dir, item["filename"])
        if not os.path.exists(filepath):
            # Create a skin-colored background (640x640)
            # Skin color in BGR: B=140, G=180, R=235
            img = np.zeros((640, 640, 3), dtype=np.uint8)
            img[:] = [140, 180, 235]
            
            if item["status"] == "healed":
                # A thin, faded pink scar line
                cv2.line(img, (150, 320), (490, 320), (180, 180, 210), thickness=3, lineType=cv2.LINE_AA)
                cv2.line(img, (150, 320), (490, 320), (160, 160, 200), thickness=1, lineType=cv2.LINE_AA)
            elif item["status"] == "healing":
                # A thicker red incision line with suture marks
                cv2.line(img, (150, 320), (490, 320), (50, 50, 180), thickness=6, lineType=cv2.LINE_AA)
                for x in range(180, 480, 40):
                    cv2.line(img, (x, 290), (x, 350), (40, 40, 40), thickness=2)
            elif item["status"] == "infected":
                # Red inflamed halo
                cv2.circle(img, (320, 320), 120, (60, 60, 220), thickness=-1)
                # Yellow-green slough/pus center
                cv2.circle(img, (320, 320), 70, (80, 200, 200), thickness=-1)
                # Scattered spots
                cv2.circle(img, (280, 290), 15, (60, 180, 180), thickness=-1)
                cv2.circle(img, (350, 340), 12, (65, 190, 190), thickness=-1)
                
            cv2.imwrite(filepath, img)
            
    if not os.path.exists(metadata_path):
        with open(metadata_path, "w") as f:
            json.dump(defaults, f, indent=4)

init_dataset()

# Mount dataset folder for static file access
dataset_dir = os.path.join(os.path.dirname(__file__), "dataset")
app.mount("/dataset_images", StaticFiles(directory=dataset_dir), name="dataset")

# Schemas
class BoundingBox(BaseModel):
    xmin: int
    ymin: int
    xmax: int
    ymax: int
    confidence: float

class DatasetMatch(BaseModel):
    filename: str
    similarity: float
    status: str
    notes: str
    url: str

class DiagnosticReport(BaseModel):
    healingPercentage: float
    riskLevel: str
    infectionProbability: float
    estimatedRecoveryDays: int
    healingTrend: str
    recommendations: List[str]
    woundStage: str
    boundingBox: Optional[BoundingBox] = None
    datasetMatch: Optional[DatasetMatch] = None

class ModelStatus(BaseModel):
    status: str
    activeModel: str
    confidenceThreshold: float
    gpuEnabled: bool
    tpuThreadCount: int

@app.get("/")
def home():
    return {
        "status": "online",
        "service": "HealTrack AI Diagnostic Server",
        "docs_url": "/docs"
    }

@app.get("/dataset")
def get_dataset():
    """
    Returns list of all images in the reference dataset.
    """
    metadata_path = os.path.join(dataset_dir, "metadata.json")
    if not os.path.exists(metadata_path):
        return []
    with open(metadata_path, "r") as f:
        data = json.load(f)
    # Add absolute URLs for static serving
    for item in data:
        item["url"] = f"http://localhost:8000/dataset_images/{item['filename']}"
    return data

@app.post("/dataset/upload")
async def upload_dataset_image(
    file: UploadFile = File(...),
    status: str = Form(...),
    notes: str = Form("")
):
    """
    Uploads a new reference image and adds it to the dataset metadata.
    """
    if not file.filename.lower().endswith(('.png', '.jpg', '.jpeg')):
        raise HTTPException(status_code=400, detail="Only PNG, JPG, or JPEG files are allowed.")
    
    # Save the file
    import time
    timestamp = int(time.time())
    safe_filename = f"{timestamp}_{file.filename.replace(' ', '_')}"
    filepath = os.path.join(dataset_dir, safe_filename)
    
    try:
        with open(filepath, "wb") as f:
            shutil.copyfileobj(file.file, f)
            
        # Update metadata
        metadata_path = os.path.join(dataset_dir, "metadata.json")
        metadata = []
        if os.path.exists(metadata_path):
            with open(metadata_path, "r") as f:
                metadata = json.load(f)
                
        new_entry = {
            "filename": safe_filename,
            "status": status,
            "notes": notes
        }
        metadata.append(new_entry)
        
        with open(metadata_path, "w") as f:
            json.dump(metadata, f, indent=4)
            
        return {
            "status": "success",
            "message": "Image successfully uploaded and added to reference dataset.",
            "data": {
                **new_entry,
                "url": f"http://localhost:8000/dataset_images/{safe_filename}"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=550, detail=f"Failed to save dataset image: {str(e)}")

@app.post("/predict", response_model=DiagnosticReport)
async def predict_wound(file: UploadFile = File(...)):
    """
    Receives surgical wound photo, compares it with reference dataset, and returns diagnostics.
    """
    if not file.filename.lower().endswith(('.png', '.jpg', '.jpeg')):
        raise HTTPException(status_code=400, detail="Only PNG, JPG, or JPEG files are allowed.")

    try:
        contents = await file.read()
        report = AIPipelineInstance.analyze_wound(contents)
        
        # Compare with reference dataset
        metadata_path = os.path.join(dataset_dir, "metadata.json")
        best_match = None
        best_similarity = -1.0
        
        if os.path.exists(metadata_path):
            with open(metadata_path, "r") as f:
                metadata = json.load(f)
                
            for item in metadata:
                filepath = os.path.join(dataset_dir, item["filename"])
                if os.path.exists(filepath):
                    sim = AIPipelineInstance.compare_similarity(contents, filepath)
                    if sim > best_similarity:
                        best_similarity = sim
                        best_match = item
                        
        if best_match:
            report["datasetMatch"] = {
                "filename": best_match["filename"],
                "similarity": best_similarity,
                "status": best_match["status"],
                "notes": best_match["notes"],
                "url": f"http://localhost:8000/dataset_images/{best_match['filename']}"
            }
            
            # Align diagnostic status with matched reference image if similarity is reasonable (e.g. >= 50%)
            if best_similarity >= 50.0:
                matched_status = best_match["status"]
                if matched_status == "infected":
                    report["healingPercentage"] = min(report["healingPercentage"], 20.0)
                    report["riskLevel"] = "RiskLevel.high"
                    report["infectionProbability"] = max(report["infectionProbability"], 0.88)
                    report["woundStage"] = "Infected Ulcer/Incision"
                    report["healingTrend"] = "HealingTrend.worsening"
                    report["recommendations"] = [
                        "Visit your surgeon immediately.",
                        "Clean wound with saline and apply prescribed antibiotic dressing.",
                        "Avoid touching the infected area directly."
                    ]
                elif matched_status == "healing":
                    report["healingPercentage"] = max(35.0, min(report["healingPercentage"], 70.0))
                    report["riskLevel"] = "RiskLevel.moderate"
                    report["infectionProbability"] = min(report["infectionProbability"], 0.3)
                    report["woundStage"] = "Granulating Proliferative Stage"
                    report["healingTrend"] = "HealingTrend.stable"
                    report["recommendations"] = [
                        "Clean wound daily with sterile saline.",
                        "Apply standard healing ointment.",
                        "Monitor for any elevated warmth or swelling."
                    ]
                elif matched_status == "healed":
                    report["healingPercentage"] = max(report["healingPercentage"], 85.0)
                    report["riskLevel"] = "RiskLevel.good"
                    report["infectionProbability"] = min(report["infectionProbability"], 0.05)
                    report["woundStage"] = "Remodeling Epithelialization Stage"
                    report["healingTrend"] = "HealingTrend.improving"
                    report["recommendations"] = [
                        "Continue gentle skin hydration.",
                        "Scar therapy gel can be applied if prescribed.",
                        "Excellent recovery progress."
                    ]
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Diagnostic Pipeline Error: {str(e)}")

@app.get("/model-status", response_model=ModelStatus)
def get_model_status():
    """
    Returns AI model weights configuration for Admin console inspection.
    """
    return {
        "status": "optimal",
        "activeModel": "YOLOv8.0-Pro & EfficientNet-B0 (Hybrid)",
        "confidenceThreshold": 0.75,
        "gpuEnabled": False, # Local cpu execution fallback
        "tpuThreadCount": 4
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

