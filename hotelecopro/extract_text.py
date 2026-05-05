import os
import re
import json

src_dir = r"c:\Users\2000m\OneDrive\Desktop\FYP\hotelecopro\src"

results = {}

# Simple regex to catch text inside JSX tags
# It looks for text that has at least one letter, ignoring purely whitespace or symbols
jsx_text_pattern = re.compile(r'>([^<>{}]*[a-zA-Z]+[^<>{}]*)<')

for root, _, files in os.walk(src_dir):
    for f in files:
        if f.endswith('.jsx') or f.endswith('.js'):
            filepath = os.path.join(root, f)
            with open(filepath, 'r', encoding='utf-8') as file:
                content = file.read()
                
                # Removing comments first to avoid extracting commented out code
                content = re.sub(r'{\s*/\*.*?\*/\s*}', '', content, flags=re.DOTALL)
                content = re.sub(r'//.*', '', content)
                
                matches = jsx_text_pattern.findall(content)
                cleaned = [m.strip() for m in matches if m.strip() and len(m.strip()) > 1]
                
                if cleaned:
                    # Deduplicate while preserving order
                    seen = set()
                    deduped = [x for x in cleaned if not (x in seen or seen.add(x))]
                    page_name = os.path.splitext(f)[0]
                    # To flatten it or group by page
                    results[page_name] = {}
                    for text in deduped:
                        # make a key out of the text
                        key = text.lower()
                        key = re.sub(r'[^a-z0-9\s]', '', key)
                        key = '_'.join(key.split()[:4]) # take first 4 words as key
                        if not key:
                            key = "val"
                        # Handle duplicate keys
                        original_key = key
                        counter = 1
                        while key in results[page_name]:
                            if results[page_name][key] == text:
                                break
                            key = f"{original_key}_{counter}"
                            counter += 1
                        results[page_name][key] = text

# Create a flattened version grouped by a unique key or hierarchical by page
output_path = os.path.join(r"c:\Users\2000m\OneDrive\Desktop\FYP\hotelecopro", "en_content.json")
with open(output_path, "w", encoding="utf-8") as out:
    json.dump(results, out, indent=4)
    
print(f"Extraction complete. Wrote to {output_path}")
