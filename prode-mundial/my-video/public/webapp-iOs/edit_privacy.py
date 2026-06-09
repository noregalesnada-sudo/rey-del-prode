from PIL import Image, ImageFilter

base = "/home/elmapache/Documents/rey-del-prode/prode-mundial/my-video/public/webapp-iOs/"

def blur_region(img, box, radius=30):
    region = img.crop(box)
    blurred = region.filter(ImageFilter.GaussianBlur(radius))
    img.paste(blurred, box)
    return img

# --- 5.jpeg: share sheet con contactos WhatsApp ---
# Fotos circulares + nombres: fila de contactos
img5 = Image.open(base + "5.jpeg").convert("RGB")
# Toda la franja con las fotos y nombres (aprox y=840 a y=1080)
blur_region(img5, (0, 840, 739, 1080), radius=35)
img5.save(base + "5_edited.jpeg", quality=90)
print("5_edited.jpeg OK")

# --- 6.jpeg: share sheet expandido (mismos contactos arriba) ---
img6 = Image.open(base + "6.jpeg").convert("RGB")
# Contactos aparecen cerca del top del sheet expandido (aprox y=270 a y=545)
blur_region(img6, (0, 270, 739, 545), radius=35)
img6.save(base + "6_edited.jpeg", quality=90)
print("6_edited.jpeg OK")

# --- 8.jpeg: pantalla inicio con widget calendario ---
img8 = Image.open(base + "8.jpeg").convert("RGB")
# Widget calendario: solo la parte de eventos (derecha del widget, aprox x=230 al borde, y=70 a y=330)
blur_region(img8, (230, 70, 739, 335), radius=35)
img8.save(base + "8_edited.jpeg", quality=90)
print("8_edited.jpeg OK")
