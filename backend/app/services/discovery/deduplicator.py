import re
import hashlib

def generate_dedup_hash(name: str, phone: str = None, city: str = "") -> str:
    """
    Generates a deterministic unique hash from cleaned business name and phone/locality.
    Prevents duplicate entries across repeated scans.
    """
    clean_name = re.sub(r'[^a-zA-Z0-9]', '', name).lower()
    
    clean_phone = ""
    if phone:
        digits = re.sub(r'[^0-9]', '', phone)
        clean_phone = digits[-10:] if len(digits) >= 10 else digits
    
    clean_city = re.sub(r'[^a-zA-Z0-9]', '', city).lower()
    
    composite = f"{clean_name}_{clean_phone}_{clean_city}"
    return hashlib.md5(composite.encode("utf-8")).hexdigest()
