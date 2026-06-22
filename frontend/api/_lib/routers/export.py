from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from _lib.limiter import limiter
from _lib.schemas.brd import ExportBRDDocument, MAX_PROJECT_NAME
from _lib.services.renderer import render_brd_to_docx
import io

router = APIRouter()

class ExportRequest(BaseModel):
    brd: ExportBRDDocument
    project_name: str = Field(default="", max_length=MAX_PROJECT_NAME)

@router.post("/export")
@limiter.limit("20/minute")
async def export_brd(request: Request, export_request: ExportRequest):
    """
    Accepts a complete BRD document and returns a .docx file.
    """
    try:
        buffer = io.BytesIO()
        render_brd_to_docx(
            export_request.brd.model_dump(),
            buffer,
            project_name=export_request.project_name,
        )
        buffer.seek(0)

        return StreamingResponse(
            buffer,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": "attachment; filename=brd.docx"},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
