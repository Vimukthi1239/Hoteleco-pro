import os
import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sklearn.neighbors import BallTree
import uvicorn

app = FastAPI(
    title="Tourism Recommendation API",
    description="API for recommending Hotels based on Destinations and vice-versa using K-Nearest Neighbors."
)

# Add CORS Middleware to allow requests from your React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (for development). In production, set this to your frontend URL.
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Earth radius in kilometers for Haversine distance conversion
EARTH_RADIUS_KM = 6371.0

# File paths - relative to the directory where the script is executed
DESTINATIONS_FILE = "data/Destination Site.csv"
# Notice the space in 'Hotels .csv' to match your directory contents
HOTELS_FILE = "data/Hotels .csv"

# Global states
destinations_df = pd.DataFrame()
hotels_df = pd.DataFrame()
dest_tree = None
hotel_tree = None

# Pydantic models for API requests
class ItemModel(BaseModel):
    name: str
    latitude: float
    longitude: float

def clean_data(df: pd.DataFrame, name_col: str) -> pd.DataFrame:
    """
    Cleans the dataframe based on the core requirements:
    1. Removes rows with null Latitude/Longitude.
    2. Filters out coordinates outside Sri Lanka (Lat: 5.9 to 9.9, Lon: 79.6 to 81.9).
    3. Removes duplicate entries based on names.
    """
    # 1. Remove nulls
    df = df.dropna(subset=['Latitude', 'Longitude'])
    
    # Ensure columns are numeric
    df['Latitude'] = pd.to_numeric(df['Latitude'], errors='coerce')
    df['Longitude'] = pd.to_numeric(df['Longitude'], errors='coerce')
    df = df.dropna(subset=['Latitude', 'Longitude'])
    
    # 2. Filter outside Sri Lanka bounds
    lat_filter = (df['Latitude'] >= 5.9) & (df['Latitude'] <= 9.9)
    lon_filter = (df['Longitude'] >= 79.6) & (df['Longitude'] <= 81.9)
    df = df[lat_filter & lon_filter]
    
    # 3. Remove duplicates based on the primary name
    df = df.drop_duplicates(subset=[name_col], keep='first')
    
    return df.reset_index(drop=True)

def build_tree(df: pd.DataFrame):
    """
    Builds a BallTree using the Haversine metric.
    Note: Haversine requires coordinates in radians (Latitude, Longitude).
    """
    if df.empty:
        return None
    # Convert latitude and longitude to radians for the Haversine formula
    coords = np.radians(df[['Latitude', 'Longitude']].values)
    return BallTree(coords, metric='haversine')

def load_and_prep_data():
    """
    Loads data from CSV files, cleans it, and builds the initial BallTrees.
    """
    global destinations_df, hotels_df, dest_tree, hotel_tree
    
    # Load Destinations
    if os.path.exists(DESTINATIONS_FILE):
        raw_dest = pd.read_csv(DESTINATIONS_FILE)
        raw_dest.columns = raw_dest.columns.str.strip()  # Clean up column headers
        
        # Identify the name column (could be 'Destination' or something similar)
        name_col = 'Destination' if 'Destination' in raw_dest.columns else raw_dest.columns[0]
        # Standardize the name column to 'Name' for internal processing
        raw_dest = raw_dest.rename(columns={name_col: 'Name'})
        destinations_df = clean_data(raw_dest, 'Name')
    else:
        destinations_df = pd.DataFrame(columns=['Name', 'Latitude', 'Longitude'])
        
    # Load Hotels
    if os.path.exists(HOTELS_FILE):
        raw_hotel = pd.read_csv(HOTELS_FILE)
        raw_hotel.columns = raw_hotel.columns.str.strip()  # Clean up column headers
        
        # Identify the name column (could be 'Hotel' or something similar)
        name_col = 'Hotel' if 'Hotel' in raw_hotel.columns else raw_hotel.columns[0]
        # Standardize the name column to 'Name' for internal processing
        raw_hotel = raw_hotel.rename(columns={name_col: 'Name'})
        hotels_df = clean_data(raw_hotel, 'Name')
    else:
        hotels_df = pd.DataFrame(columns=['Name', 'Latitude', 'Longitude'])

    # Build initial BallTrees
    dest_tree = build_tree(destinations_df)
    hotel_tree = build_tree(hotels_df)
    print("Data loaded and models (BallTrees) built successfully!")

# Initialize data and models on server startup
@app.on_event("startup")
def startup_event():
    load_and_prep_data()

@app.get("/recommend/hotels")
def recommend_hotels(site_name: str, top_k: int = 5):
    """
    Returns the top K closest hotels to a specific destination.
    """
    if destinations_df.empty or hotels_df.empty or hotel_tree is None:
        raise HTTPException(status_code=404, detail="Data or models not available.")
        
    # Find the destination by name (case-insensitive)
    site = destinations_df[destinations_df['Name'].str.lower() == site_name.lower()]
    if site.empty:
        raise HTTPException(status_code=404, detail=f"Destination '{site_name}' not found.")
        
    site_lat = site.iloc[0]['Latitude']
    site_lon = site.iloc[0]['Longitude']
    
    # Query point must be in radians for Haversine
    query_coords = np.radians([[site_lat, site_lon]])
    
    # Find k nearest neighbors (cap at number of available hotels)
    k = min(top_k, len(hotels_df))
    distances, indices = hotel_tree.query(query_coords, k=k)
    
    # Convert output distances from radians to kilometers
    distances_km = distances[0] * EARTH_RADIUS_KM
    
    recommendations = []
    for idx, dist in zip(indices[0], distances_km):
        hotel = hotels_df.iloc[idx]
        recommendations.append({
            "hotel_name": hotel['Name'],
            "latitude": hotel['Latitude'],
            "longitude": hotel['Longitude'],
            "distance_km": round(dist, 2)
        })
        
    return {"destination": site.iloc[0]['Name'], "recommended_hotels": recommendations}

@app.get("/recommend/sites")
def recommend_sites(hotel_name: str, top_k: int = 5):
    """
    Returns the top K closest destinations to a specific hotel.
    """
    if hotels_df.empty or destinations_df.empty or dest_tree is None:
        raise HTTPException(status_code=404, detail="Data or models not available.")
        
    # Find the hotel by name (case-insensitive)
    hotel = hotels_df[hotels_df['Name'].str.lower() == hotel_name.lower()]
    if hotel.empty:
        raise HTTPException(status_code=404, detail=f"Hotel '{hotel_name}' not found.")
        
    hotel_lat = hotel.iloc[0]['Latitude']
    hotel_lon = hotel.iloc[0]['Longitude']
    
    # Query point must be in radians for Haversine
    query_coords = np.radians([[hotel_lat, hotel_lon]])
    
    # Find k nearest neighbors (cap at number of available destinations)
    k = min(top_k, len(destinations_df))
    distances, indices = dest_tree.query(query_coords, k=k)
    
    # Convert output distances from radians to kilometers
    distances_km = distances[0] * EARTH_RADIUS_KM
    
    recommendations = []
    for idx, dist in zip(indices[0], distances_km):
        site = destinations_df.iloc[idx]
        recommendations.append({
            "site_name": site['Name'],
            "latitude": site['Latitude'],
            "longitude": site['Longitude'],
            "distance_km": round(dist, 2)
        })
        
    return {"hotel": hotel.iloc[0]['Name'], "recommended_sites": recommendations}

@app.post("/add/hotel")
def add_hotel(hotel: ItemModel):
    """
    Adds a new hotel to the database, saves it to CSV, and updates the model.
    """
    global hotels_df, hotel_tree
    
    # Validate coordinates inside Sri Lanka
    if not (5.9 <= hotel.latitude <= 9.9 and 79.6 <= hotel.longitude <= 81.9):
        raise HTTPException(status_code=400, detail="Coordinates are outside Sri Lanka.")
        
    # Remove existing entry if it shares the exact name (to avoid duplicates)
    hotels_df = hotels_df[hotels_df['Name'].str.lower() != hotel.name.lower()]
    
    # Append the new row
    new_row = pd.DataFrame([{
        'Name': hotel.name,
        'Latitude': hotel.latitude,
        'Longitude': hotel.longitude
    }])
    hotels_df = pd.concat([hotels_df, new_row], ignore_index=True)
    
    # Save back to CSV for persistence
    export_df = hotels_df.rename(columns={'Name': 'Hotel'})
    os.makedirs(os.path.dirname(HOTELS_FILE), exist_ok=True)
    export_df.to_csv(HOTELS_FILE, index=False)
    
    # Dynamic Learning: Re-build the BallTree index immediately
    hotel_tree = build_tree(hotels_df)
    
    return {"message": f"Hotel '{hotel.name}' added successfully. Index re-trained."}

@app.post("/add/site")
def add_site(site: ItemModel):
    """
    Adds a new destination to the database, saves it to CSV, and updates the model.
    """
    global destinations_df, dest_tree
    
    # Validate coordinates inside Sri Lanka
    if not (5.9 <= site.latitude <= 9.9 and 79.6 <= site.longitude <= 81.9):
        raise HTTPException(status_code=400, detail="Coordinates are outside Sri Lanka.")
        
    # Remove existing entry if it shares the exact name (to avoid duplicates)
    destinations_df = destinations_df[destinations_df['Name'].str.lower() != site.name.lower()]
    
    # Append the new row
    new_row = pd.DataFrame([{
        'Name': site.name,
        'Latitude': site.latitude,
        'Longitude': site.longitude
    }])
    destinations_df = pd.concat([destinations_df, new_row], ignore_index=True)
    
    # Save back to CSV for persistence
    export_df = destinations_df.rename(columns={'Name': 'Destination'})
    os.makedirs(os.path.dirname(DESTINATIONS_FILE), exist_ok=True)
    export_df.to_csv(DESTINATIONS_FILE, index=False)
    
    # Dynamic Learning: Re-build the BallTree index immediately
    dest_tree = build_tree(destinations_df)
    
    return {"message": f"Destination '{site.name}' added successfully. Index re-trained."}

if __name__ == "__main__":
    # Run the server via uvicorn programmatically
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
