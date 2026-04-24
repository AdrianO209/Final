# 1. Use the Python version that matches your environment
FROM python:3.13-slim

# 2. Set the folder inside the container where your code lives
WORKDIR /app

# 3. Install system tools needed to compile the Postgres driver (psycopg2)
RUN apt-get update && apt-get install -y \
  libpq-dev \
  gcc \
  && rm -rf /var/lib/apt/lists/*

# 4. Copy and install your Python libraries first (for faster builds)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy your actual Flask code into the container
COPY . .

# 6. Set the Port to 8080 (standard for Railway)
ENV PORT=8080

# 7. Start the app using Gunicorn
# "app:app" means: look in app.py for the variable named 'app'
CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:$PORT app:app"]
