from flask import Flask, request, jsonify, session, send_file #import karoo jiiii
from flask_cors import CORS
import pandas as pd
import os
import re
import numpy as np
from flask import Response
import json
from werkzeug.utils import secure_filename


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
                if (ba in batch or batch == "LALL" or batch == "PALL") and subject_code == subj:
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
        
    # Get the year from the form data
    year = request.form.get('year')  # Assuming the year is sent in the form data
    if year is None:
        return jsonify({"error": "Year is required"}), 400

    try:
        # Convert year to integer
        year = int(year)

        # Define the row index mapping based on the year
        year_to_indices = {
            1: (93, 53),
            2: (69, 82),  
            3: (56, 73), 
            4: (43, 54)  
        }

        # Check if the year is valid
        if year not in year_to_indices:
            return jsonify({"error": "Invalid year provided"}), 400

        # Save the uploaded file temporarily
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(file.filename))
        file.save(file_path)
        
        # Process the Excel file using pandas
        timetable = pd.read_excel(file_path)
        print(timetable.head())
        print("DataFrame shape:", timetable.shape)  # Print the shape of the DataFrame
        print("year",year)

        timetable.columns = timetable.iloc[0]
        timetable = timetable[1:].reset_index(drop=True)
      
        # Get the row indices for the specified year
        start_row, end_row = year_to_indices[year]
        print("Rows to fetch",start_row,end_row)
        # Extract and clean subject data
        year_to_columns = {

            1: [

                (1, 2),  # Columns for "Subject Code" and "Subject Name"
            ],

            2: [

                (5, 6),

                (7, 8),

            ],

            3: [

                (1, 2),  # Columns for "Subject Code" and "Subject Name"
                (3, 4),
                (5, 6),
                (8, 9),
            ],

            4: [

                (1, 2),  # Columns for "Subject Code" and "Subject Name"

                (7, 8),

            ]

        }


        # Get the columns to extract for the specified year

        columns_to_extract = year_to_columns.get(year, [])

        print("Columns to extract:", columns_to_extract)

        data = []
        for col_code, col_name in columns_to_extract:
            extracted_data = timetable.iloc[start_row:, [col_code, col_name]].dropna(how="all").values
            data.extend(extracted_data)
            
        # Create a DataFrame for the cleaned data
        df_cleaned = pd.DataFrame(data, columns=['Subject Code', 'Subject Name'])
        df_cleaned.dropna(how='all', inplace=True)
        
        # Clean the string data
        df_cleaned['Subject Code'] = df_cleaned['Subject Code'].astype(str).apply(lambda x: x.strip().replace('\n', ' '))
        df_cleaned['Subject Name'] = df_cleaned['Subject Name'].astype(str).apply(lambda x: x.strip().replace('\n', ' '))
        
        # Filter out header rows
        df_cleaned = df_cleaned[~df_cleaned['Subject Code'].isin(['SUBJECT CODE', 'SUBJECT NAME'])]
        df_cleaned = df_cleaned[~df_cleaned['Subject Name'].isin(['SUBJECT CODE', 'SUBJECT NAME'])]
        
        # Create the subject dictionary
        cleaned_subject_data = pd.Series(df_cleaned['Subject Code'].values, 
                                       index=df_cleaned['Subject Name'].values).to_dict()
        
        # Consolidate lectures for each day
        result = []
        temp_row = None
        
        for i, row in timetable.iterrows():
            if pd.notna(row["Day"]):
                if temp_row is not None:
                    result.append(temp_row)
                temp_row = row.copy()
            else:
                if temp_row is not None:
                    for col in row.index:
                        if col != "Day" and pd.notna(row[col]):
                            current_value = str(temp_row.get(col, "")).strip()
                            new_value = str(row[col]).strip()
                            temp_row[col] = f"{current_value}, {new_value}" if current_value else new_value
        
        if temp_row is not None:
            result.append(temp_row)
            
        final_df = pd.DataFrame(result).reset_index(drop=True)
        
        # Clean the consolidated data
        consolidated_data = []
        for record in final_df.to_dict(orient="records"):
            cleaned_record = {}
            for key, value in record.items():
                if pd.isna(value):
                    cleaned_record[key] = None
                else:
                    cleaned_record[key] = str(value).strip().replace('\n', ' ')
            consolidated_data.append(cleaned_record)
        
        # Clean up the temporary file
        os.remove(file_path)
        
        # Prepare and return the response
        response_data = {
            "df_dict": cleaned_subject_data,
            "consolidated": consolidated_data
        }
        
        return jsonify(response_data)
        
    except Exception as e:
        # Clean up the file in case of error
        if 'file_path' in locals():
            try:
                os.remove(file_path)
            except:
                pass
            print({"Error": str(e)})
        return jsonify({"error": str(e)}), 500
@app.route('/download/<int:year>', methods=['GET'])

def download_timetable(year):

    # Define the path to the Excel file based on the year

    NEW_FOLDER = 'uploads2'  # Change this to your desired folder path


    # Define the path to the Excel file based on the year

    file_path = os.path.join(NEW_FOLDER, f'timetable_{year}.xls')


    # Check if the file exists

    if not os.path.exists(file_path):

        return jsonify({"error": "File not found for the specified year"}), 404


    # Send the file as a response

    return send_file(file_path, as_attachment=True)


# New route to handle batch and subject code filtering
@app.route('/extract_batches', methods=['POST'])
def extract_batches():
    try:
        # Extract batch and list of subject codes from the request
        ba = request.json.get('batch')
        if ba is None:
            return jsonify({"error": "batch is required"}), 400
        # print("Batch:", ba)
        
        subj_list = request.json.get('subject_codes')
        if subj_list is None:
            return jsonify({"error": "subject_codes is required"}), 400
        # print("Subject list:", subj_list)
        if not isinstance(subj_list, list):
            return jsonify({"error": "subject_codes should be a list"}), 400

        # Extract and validate consolidated data
        consolidated_data = request.json.get('consolidated')
        if consolidated_data is None:
            return jsonify({"error": "consolidated data is required"}), 400

        # Create DataFrame with error checking
        try:
            final_df = pd.DataFrame(consolidated_data)
            print("Created DataFrame with shape:", final_df.shape)
        except Exception as df_error:
            print("Error creating DataFrame:", str(df_error))
            return jsonify({"error": f"Failed to create DataFrame: {str(df_error)}"}), 500

        # Initialize results DataFrame
        final_results = pd.DataFrame()

        # Process each subject
        for subj in subj_list:
            try:
                new_df = calle(final_df, ba, subj)
                if new_df is not None and not new_df.empty:
                    final_results = pd.concat([final_results, new_df], ignore_index=True)
            except Exception as subj_error:
                print(f"Error processing subject {subj}:", str(subj_error))
                return jsonify({"error": f"Error processing subject {subj}: {str(subj_error)}"}), 500

        # Check if we have any results
        if final_results.empty:
            return jsonify({"error": "No results found for the given criteria"}), 404

        # Replace all NaN values with None
        final_results = final_results.replace({pd.NA: None, pd.NaT: None})
        final_results = final_results.where(pd.notna(final_results), None)

        # Convert to JSON and return response
        result_json = final_results.to_dict(orient="records")
        
        # Additional step to ensure all NaN/null values are consistently represented
        for record in result_json:
            for key, value in record.items():
                if pd.isna(value) or value == 'NaN':
                    record[key] = None

        response = json.dumps(result_json, ensure_ascii=False, separators=(',', ':'))
        return Response(response, mimetype='application/json')

    except Exception as e:
        print("Unexpected error:", str(e))
        return jsonify({"error": str(e)}), 500
if __name__ == '__main__':
    app.run(debug=True)
