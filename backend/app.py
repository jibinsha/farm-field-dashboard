from datetime import datetime
from fastapi.responses import FileResponse
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd

app = FastAPI()

# ---------------------------------------------------
# ENABLE CORS
# ---------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------
# LOAD FILES
# ---------------------------------------------------

farmers_file = "data/Final_Field_Plan.xlsx"

routes_file = r"C:\Users\HAMZA P\Desktop\farm_planner\output\Final_Routes.xlsx"

farmers_df = pd.read_excel(farmers_file)

routes_df = pd.read_excel(routes_file)

# ---------------------------------------------------
# CLEAN DATA
# ---------------------------------------------------

farmers_df['Day'] = (
    farmers_df['Day']
    .astype(float)
    .astype(int)
    .astype(str)
)

routes_df['Day'] = (
    routes_df['Day']
    .astype(float)
    .astype(int)
    .astype(str)
)

farmers_df['Team'] = (
    farmers_df['Team']
    .astype(str)
    .str.strip()
)

routes_df['Team'] = (
    routes_df['Team']
    .astype(str)
    .str.strip()
)

# ---------------------------------------------------
# HOME
# ---------------------------------------------------

@app.get("/")
def home():

    return {
        "message": "Farm Dashboard API Running"
    }

# ---------------------------------------------------
# GET DAYS
# ---------------------------------------------------

@app.get("/days")
def get_days():

    days = sorted(
        farmers_df['Day']
        .astype(int)
        .unique()
        .tolist()
    )

    return days

# ---------------------------------------------------
# GET TEAMS
# ---------------------------------------------------

@app.get("/teams/{day}")
def get_teams(day: str):

    # Debug print
    print("Selected Day:", day)

    # Convert safely
    subset = farmers_df[
        farmers_df['Day'].astype(str).str.strip()
        ==
        str(day).strip()
    ]

    print(subset[['Day', 'Team']].head())

    teams = (
        subset['Team']
        .astype(str)
        .str.strip()
        .unique()
        .tolist()
    )

    return teams

# ---------------------------------------------------
# GET FARMERS
# ---------------------------------------------------

@app.get("/farmers/{day}/{team}")
def get_farmers(day: str, team: str):

    subset = farmers_df[
        (farmers_df['Day'] == str(day))
        &
        (farmers_df['Team'] == str(team))
    ]

    return subset.to_dict(
        orient='records'
    )

# ---------------------------------------------------
# GET ROUTE
# ---------------------------------------------------

@app.get("/route/{day}/{team}")
def get_route(day: str, team: str):

    subset = routes_df[
        (routes_df['Day'] == str(day))
        &
        (routes_df['Team'] == str(team))
    ]

    if len(subset) == 0:
        return {}

    return subset.iloc[0].to_dict()
# ---------------------------------------------------
# PROGRESS FILE
# ---------------------------------------------------

progress_file = "progress.csv"

# Create file if not exists
if not os.path.exists(progress_file):

    progress_df = pd.DataFrame(columns=[
        "Bp Number farms",
        "Status",
        "Completed_Time"
    ])

    progress_df.to_csv(progress_file, index=False)

# ---------------------------------------------------
# COMPLETE FARMER
# ---------------------------------------------------

@app.post("/complete/{bp_number}")
def complete_farmer(bp_number: str):

    progress_df = pd.read_csv(progress_file)

    current_time = datetime.now().strftime(
        "%Y-%m-%d %H:%M:%S"
    )

    # Remove existing record
    progress_df = progress_df[
        progress_df['Bp Number farms'] != bp_number
    ]

    # Add completed row
    new_row = pd.DataFrame([{
        "Bp Number farms": bp_number,
        "Status": "Completed",
        "Completed_Time": current_time
    }])

    progress_df = pd.concat(
        [progress_df, new_row],
        ignore_index=True
    )

    progress_df.to_csv(
        progress_file,
        index=False
    )

    return {
        "message": "Farmer marked completed"
    }
# ---------------------------------------------------
# UNDO COMPLETE
# ---------------------------------------------------

@app.post("/undo/{bp_number}")
def undo_complete(bp_number: str):

    progress_df = pd.read_csv(progress_file)

    progress_df = progress_df[
        progress_df['Bp Number farms']
        !=
        bp_number
    ]

    progress_df.to_csv(
        progress_file,
        index=False
    )

    return {
        "message": "Completion removed"
    }
# ---------------------------------------------------
# GET PROGRESS
# ---------------------------------------------------

@app.get("/progress")
def get_progress():

    progress_df = pd.read_csv(progress_file)

    return progress_df.to_dict(
        orient='records'
    )

# ---------------------------------------------------
# DOWNLOAD REPORT
# ---------------------------------------------------

@app.get("/download-report")
def download_report():

    progress_df = pd.read_csv(progress_file)

    merged = farmers_df.merge(
        progress_df,
        on="Bp Number farms",
        how="left"
    )

    merged['Status'] = merged['Status'].fillna(
        "Pending"
    )

    output_file = "Daily_Progress_Report.xlsx"

    merged.to_excel(
        output_file,
        index=False
    )

    return FileResponse(
        output_file,
        filename=output_file
    )
