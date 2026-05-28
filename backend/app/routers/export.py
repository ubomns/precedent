from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from app.services.renderer import render_brd_to_docx
import io

router = APIRouter()

class ExportRequest(BaseModel):
    brd: dict
    project_name: str = ""

@router.post("/export")
async def export_brd(request: ExportRequest):
    """
    Accepts a complete BRD document (as dict) and returns a .docx file.
    """
    try:
        buffer = io.BytesIO()
        render_brd_to_docx(request.brd, buffer, project_name=request.project_name)
        buffer.seek(0)

        return StreamingResponse(
            buffer,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": "attachment; filename=brd.docx"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
