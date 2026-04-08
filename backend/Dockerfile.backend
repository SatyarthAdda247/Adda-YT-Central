FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
# Sensitive files (service account JSON, tokens.json) are NOT copied here.
# They are mounted at runtime via Kubernetes Secrets.
COPY main.py auth_service.py youtube_service.py ./

EXPOSE 8000

CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
