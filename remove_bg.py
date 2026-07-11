from PIL import Image

img = Image.open('public/pure_crest.png').convert("RGBA")
datas = img.getdata()

# Check top left pixel color
bg_color = datas[0]
print(f"Background color is: {bg_color}")

newData = []
# Tolerance for background
tolerance = 30

for item in datas:
    # If pixel is close to bg_color
    if abs(item[0] - bg_color[0]) < tolerance and abs(item[1] - bg_color[1]) < tolerance and abs(item[2] - bg_color[2]) < tolerance:
        newData.append((255, 255, 255, 0))
    else:
        newData.append(item)

img.putdata(newData)
img.save('public/pure_crest_transparent.png', "PNG")
print("Successfully removed background based on top-left pixel!")
