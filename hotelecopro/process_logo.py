from PIL import Image
import collections

def process():
    img_path = r"c:\Users\2000m\OneDrive\Desktop\FYP\hotelecopro\public\images\logo.png"
    img = Image.open(img_path).convert("RGBA")
    width, height = img.size
    pixels = img.load()
    
    # BFS to find all background pixels starting from the boundaries
    visited = [[False for _ in range(height)] for _ in range(width)]
    queue = collections.deque()
    
    # Add all boundary pixels to the queue
    for x in range(width):
        queue.append((x, 0))
        queue.append((x, height - 1))
        visited[x][0] = True
        visited[x][height - 1] = True
        
    for y in range(height):
        queue.append((0, y))
        queue.append((width - 1, y))
        visited[0][y] = True
        visited[width - 1][y] = True
        
    # Helper to check if a pixel color is background (neutral grey or white)
    def is_background_color(r, g, b):
        # Checkerboard is white (255,255,255) and grey (~215,215,215)
        # Check if it's very close to neutral grey/white
        is_neutral = abs(r - g) < 15 and abs(g - b) < 15 and abs(r - b) < 15
        brightness = (r + g + b) // 3
        return is_neutral and brightness > 180
        
    background_pixels = set()
    
    while queue:
        cx, cy = queue.popleft()
        r, g, b, a = pixels[cx, cy]
        
        if is_background_color(r, g, b):
            background_pixels.add((cx, cy))
            
            # Check 4-neighbors
            for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                nx, ny = cx + dx, cy + dy
                if 0 <= nx < width and 0 <= ny < height:
                    if not visited[nx][ny]:
                        visited[nx][ny] = True
                        queue.append((nx, ny))
                        
    # Set all background pixels to fully transparent
    for x, y in background_pixels:
        pixels[x, y] = (0, 0, 0, 0)
        
    # Also set any pixel that is neutral white/grey and not visited but near the edges to transparent just in case
    # Actually, the BFS is very good. Let's save the transparent image first to find its bounding box.
    img.save(r"c:\Users\2000m\OneDrive\Desktop\FYP\hotelecopro\public\images\logo_transparent.png")
    
    # Reload to get bounding box of remaining contents
    trans_img = Image.open(r"c:\Users\2000m\OneDrive\Desktop\FYP\hotelecopro\public\images\logo_transparent.png")
    bbox = trans_img.getbbox()
    print(f"Content bounding box after removing background: {bbox}")
    
    if not bbox:
        print("Error: Bounding box is empty! The entire image was marked as background.")
        return
        
    # Crop to the content bounding box
    trimmed_img = trans_img.crop(bbox)
    trimmed_img.save(r"c:\Users\2000m\OneDrive\Desktop\FYP\hotelecopro\public\images\logo_full.png")
    print("Saved logo_full.png")
    
    # Crop the emblem (the circle on top)
    tw, th = trimmed_img.size
    print(f"Trimmed logo size: {tw}x{th}")
    
    # The emblem is a circle, which means its height should be equal to its width
    # In the logo, the circle takes the full width of the trimmed image.
    # So emblem height is exactly equal to trimmed width.
    # Let's crop from y=0 to y=tw.
    emblem_img = trimmed_img.crop((0, 0, tw, tw))
    emblem_img.save(r"c:\Users\2000m\OneDrive\Desktop\FYP\hotelecopro\public\images\logo_emblem.png")
    print(f"Saved logo_emblem.png with size {emblem_img.size}")
    
    # We can also save a small logo (e.g. 120x120) for navigation bars
    logo_nav = emblem_img.resize((120, 120), Image.Resampling.LANCZOS)
    logo_nav.save(r"c:\Users\2000m\OneDrive\Desktop\FYP\hotelecopro\public\images\logo_nav.png")
    print("Saved logo_nav.png")

if __name__ == "__main__":
    process()
