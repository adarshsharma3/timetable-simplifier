from flask import Flask, request, jsonify, session
from flask_cors import CORS
import pandas as pd
import os
import re
import numpy as np

app = Flask(__name__)

# Enable CORS for all domains or specific domains if needed
CORS(app)

# Secret key for session management
app.secret_key = os.urandom(24)

# Directory to temporarily save uploaded files
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Function to extract batches and subject codes
def extract_batches_and_codes(row):
    row = str(row)
    # Regular expression to match:
    # 1. Batch (before the parentheses),
    # 2. Subject Code (inside the parentheses),
    # 3. The text after the parentheses (after the subject code)
    matches = re.findall(r'(\S+)\(([^)]+)\)(.*?)(?=\s*,|\s*$)', row)
    return matches

# Function to filter and match batches and subject codes
def calle(final_df, ba, subj):
    # Initialize a new DataFrame with the same shape as final_df to store results
    new_df = pd.DataFrame(np.nan, index=final_df.index, columns=final_df.columns)

    # Iterate through each cell in the DataFrame
    for row_idx, row in final_df.iterrows():
        for col_idx, cell in row.items():
            # Skip if the cell is empty or NaN
            if pd.isna(cell) or cell == '':
                continue

            # Extract batch and subject code pairs for the current cell
            matches = extract_batches_and_codes(cell)

            # Loop through the extracted pairs and check for matching batch and subject code
            for match in matches:
                batch, subject_code, room = match

                # If both batch and subject code match the condition, store them in the new DataFrame
                if (ba in batch or batch == "LALL") and subject_code == subj:
                    new_df.at[row_idx, col_idx] = f"{batch}({subject_code}){room}"  # Storing in new DataFrame

    # Return the new DataFrame
    return new_df

# Existing Flask route for uploading and processing timetable
@app.route('/upload', methods=['POST'])
def upload_timetable():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    try:
        # Save the uploaded file temporarily
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(file_path)

        # Store the file path in session for later use
        session['file_path'] = file_path

        # Process the Excel file using pandas
        timetable = pd.read_excel(file_path)

        # Ensure that the first row is set as column names
        timetable.columns = timetable.iloc[0]
        timetable = timetable[1:].reset_index(drop=True)

        # Extract and clean subject data
        columns_to_extract = [
            (1, 2),  # Columns for "Subject Code" and "Subject Name"
            (3, 4),
            (5, 6),
            (8, 9)   # Adjust as needed
        ]

        data = []
        for col_code, col_name in columns_to_extract:
            extracted_data = timetable.iloc[56:73, [col_code, col_name]].dropna(how="all").values
            data.extend(extracted_data)

        # Create a DataFrame for the cleaned data
        df_cleaned = pd.DataFrame(data, columns=['Subject Code', 'Subject Name'])
        df_cleaned.dropna(how='all', inplace=True)
        df_cleaned['Subject Code'] = df_cleaned['Subject Code'].astype(str)
        df_cleaned['Subject Name'] = df_cleaned['Subject Name'].astype(str)
        df_cleaned = df_cleaned[~df_cleaned['Subject Code'].isin(['SUBJECT CODE', 'SUBJECT NAME'])]
        df_cleaned = df_cleaned[~df_cleaned['Subject Name'].isin(['SUBJECT CODE', 'SUBJECT NAME'])]

        cleaned_subject_data = pd.Series(df_cleaned['Subject Code'].values, index=df_cleaned['Subject Name'].values).to_dict()
        session['cleaned_subject_data'] = cleaned_subject_data

        # Consolidate lectures for each day
        result = []
        temp_row = None

        for i, row in timetable.iterrows():
            if pd.notna(row["Day"]):
                if temp_row is not None:
                    result.append(temp_row)
                temp_row = row.copy()
            else:
                for col in row.index:
                    if col != "Day" and pd.notna(row[col]):
                        temp_row[col] = temp_row.get(col, "") + ", " + row[col] if pd.notna(temp_row[col]) else row[col]

        if temp_row is not None:
            result.append(temp_row)

        final_df = pd.DataFrame(result).reset_index(drop=True)
        consolidated_data = final_df.to_dict(orient="records")
        # session['consolidated_data'] = consolidated_data

        # Return both cleaned subject data and consolidated timetable data
        df_dict = pd.Series(df_cleaned['Subject Code'].values, index=df_cleaned['Subject Name'].values).to_dict()
        # print(df_dict) 
        # Return the dictionary as JSON
        return jsonify({"df_dict":df_dict, "consolidated": consolidated_data})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# New route to handle batch and subject code filtering
@app.route('/extract_batches', methods=['POST'])
def extract_batches():
    try:
        # Extract batch and list of subject codes from the request
        ba = request.json.get('batch')
        print(ba)
        subj_list = request.json.get('subject_codes')  # List of subject codes
        print(subj_list)

        if not isinstance(subj_list, list):
            return jsonify({"error": "subject_codes should be a list"}), 400

        # Get the consolidated data from the session
        final_df = pd.DataFrame(request.json.get('consolidated'))

        # Initialize a DataFrame to store results for all subject codes
        final_results = pd.DataFrame()

        # Loop through each subject code and filter the timetable for the given batch
        for subj in subj_list:
            # Apply the calle function to filter and match the batch and subject code
            new_df = calle(final_df, ba, subj)

            # Append the filtered results to the final_results DataFrame
            final_results = pd.concat([final_results, new_df], ignore_index=True)

       
        print(final_results) 


        return jsonify(final_results.to_dict(orient="records"))

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/get_cleaned_subject_data', methods=['GET'])
def get_cleaned_subject_data():
    try:
        # Get the cleaned subject data from session
        cleaned_subject_data = session.get('cleaned_subject_data', {})

        # If no cleaned subject data exists in the session, return an error
        if not cleaned_subject_data:
            return jsonify({"error": "Cleaned subject data not found"}), 404

        # Return the cleaned subject data as JSON
        return jsonify(cleaned_subject_data)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
