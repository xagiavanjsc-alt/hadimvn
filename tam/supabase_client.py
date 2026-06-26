"""
Shared Supabase client module for Python scripts
Provides common functions for fetching, uploading, and managing Supabase data
"""
import os
import requests
import logging
from typing import List, Dict, Any, Optional
from collections import Counter
from dotenv import load_dotenv

# ================== CONFIGURATION ==================
# Load environment variables from .env file
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in .env file")


# ================== LOGGING SETUP ==================
def setup_logger(name: str, level: int = logging.INFO) -> logging.Logger:
    """Setup logger with consistent format"""
    logger = logging.getLogger(name)
    logger.setLevel(level)
    
    # Avoid duplicate handlers
    if not logger.handlers:
        handler = logging.StreamHandler()
        formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        logger.addHandler(handler)
    
    return logger


# ================== HEADERS ==================
def get_headers() -> Dict[str, str]:
    """Get standard Supabase headers"""
    return {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
    }


def get_headers_with_content_type() -> Dict[str, str]:
    """Get Supabase headers with Content-Type for POST/PUT/DELETE"""
    headers = get_headers()
    headers['Content-Type'] = 'application/json'
    return headers


# ================== FETCH FUNCTIONS ==================
def fetch_all_data(
    table: str,
    select_fields: str = "*",
    limit: int = 1000,
    order: str = "id",
    filters: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Generic fetch function for Supabase with pagination
    
    Args:
        table: Table name
        select_fields: Fields to select (default: "*")
        limit: Batch size (default: 1000)
        order: Order by field (default: "id")
        filters: Additional filters (e.g., "id=gt.0")
    
    Returns:
        List of all records
    """
    headers = get_headers()
    all_data = []
    offset = 0
    
    while True:
        url = f"{SUPABASE_URL}/rest/v1/{table}?select={select_fields}&order={order}&limit={limit}&offset={offset}"
        if filters:
            url += f"&{filters}"
        
        try:
            response = requests.get(url, headers=headers, timeout=30)
            response.raise_for_status()
            batch = response.json()
            
            if not batch:
                break
            
            all_data.extend(batch)
            
            if len(batch) < limit:
                break
            
            offset += limit
        except requests.exceptions.RequestException as e:
            logging.error(f"Error fetching data: {e}")
            break
    
    return all_data


def fetch_single_query(
    table: str,
    select_fields: str = "*",
    filters: Optional[str] = None,
    order: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Fetch data with a single query (no pagination)
    
    Args:
        table: Table name
        select_fields: Fields to select (default: "*")
        filters: Filters (e.g., "id=gt.0")
        order: Order by field
    
    Returns:
        List of records
    """
    headers = get_headers()
    url = f"{SUPABASE_URL}/rest/v1/{table}?select={select_fields}"
    
    if filters:
        url += f"&{filters}"
    if order:
        url += f"&order={order}"
    
    try:
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        logging.error(f"Error fetching data: {e}")
        return []


# ================== UPLOAD FUNCTIONS ==================
def upload_data(
    table: str,
    data: Dict[str, Any],
    prefer: str = "resolution=ignore-duplicates",
    timeout: int = 30
) -> bool:
    """
    Upload single record to Supabase
    
    Args:
        table: Table name
        data: Data to upload
        prefer: Prefer header (default: "resolution=ignore-duplicates")
        timeout: Request timeout in seconds
    
    Returns:
        True if successful, False otherwise
    """
    headers = get_headers_with_content_type()
    headers['Prefer'] = prefer
    
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    
    try:
        response = requests.post(url, json=data, headers=headers, timeout=timeout)
        response.raise_for_status()
        return True
    except requests.exceptions.Timeout:
        logging.error(f"Timeout when uploading to {table}")
        return False
    except requests.exceptions.RequestException as e:
        logging.error(f"Error uploading to {table}: {e}")
        return False


def upload_batch(
    table: str,
    data_list: List[Dict[str, Any]],
    prefer: str = "resolution=ignore-duplicates",
    timeout: int = 30
) -> int:
    """
    Upload multiple records to Supabase
    
    Args:
        table: Table name
        data_list: List of data to upload
        prefer: Prefer header
        timeout: Request timeout in seconds
    
    Returns:
        Number of successful uploads
    """
    success_count = 0
    for data in data_list:
        if upload_data(table, data, prefer, timeout):
            success_count += 1
    return success_count


# ================== DELETE FUNCTIONS ==================
def delete_all(
    table: str,
    filters: str = "id=gt.0",
    timeout: int = 30
) -> bool:
    """
    Delete all records from table matching filters
    
    Args:
        table: Table name
        filters: Filters for deletion (default: "id=gt.0")
        timeout: Request timeout in seconds
    
    Returns:
        True if successful, False otherwise
    """
    headers = get_headers_with_content_type()
    url = f"{SUPABASE_URL}/rest/v1/{table}?{filters}"
    
    try:
        response = requests.delete(url, headers=headers, timeout=timeout)
        response.raise_for_status()
        return True
    except requests.exceptions.RequestException as e:
        logging.error(f"Error deleting from {table}: {e}")
        return False


# ================== UTILITY FUNCTIONS ==================
def count_records(table: str, filters: Optional[str] = None) -> int:
    """
    Count records in table
    
    Args:
        table: Table name
        filters: Optional filters
    
    Returns:
        Number of records
    """
    data = fetch_single_query(table, select_fields="id", filters=filters)
    return len(data)


def find_duplicates(data: List[Dict[str, Any]], field: str) -> Dict[str, int]:
    """
    Find duplicate values in a field
    
    Args:
        data: List of records
        field: Field to check for duplicates
    
    Returns:
        Dictionary of duplicate values with counts
    """
    field_values = [d.get(field) for d in data if d.get(field)]
    count = Counter(field_values)
    return {k: v for k, v in count.items() if v > 1}


def check_missing_fields(data: List[Dict[str, Any]], field: str) -> List[Dict[str, Any]]:
    """
    Find records missing a field
    
    Args:
        data: List of records
        field: Field to check
    
    Returns:
        List of records missing the field
    """
    return [d for d in data if not d.get(field)]
