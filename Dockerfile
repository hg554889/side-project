# Use an official Python runtime as a parent image
FROM python:3.12-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV DEBIAN_FRONTEND=noninteractive
ENV CHROME_BINARY_PATH=/usr/bin/chromium
ENV CHROMEDRIVER_PATH=/usr/bin/chromedriver

# Install Chrome and required dependencies
RUN apt-get update && apt-get install -y \
    chromium \
    chromium-driver \
    fonts-ipafont-gothic \
    fonts-wqy-zenhei \
    fonts-thai-tlwg \
    fonts-liberation \
    fonts-noto \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /usr/src/app/web-crawling

# Copy requirements first for better caching
COPY requirements.txt ./
# Copy the web-crawling directory
COPY web-crawling/ ./

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Create log directory
RUN mkdir -p ../logs

# Set Chrome options for containerized environment
ENV CHROME_OPTIONS="--headless --no-sandbox --disable-dev-shm-usage --disable-gpu"
ENV PYTHONPATH="/usr/src/app/web-crawling:$PYTHONPATH"

# Define the command to run your app
CMD ["python", "main.py"]