import cv2

# Load the JPG image
img = cv2.imread('/Users/aks/Documents/Cobotiks/data/to_label/image_masks/adani-western-heights-sky-apartments-apartment-2bhk-1361sqft-1.jpg')
cv2.imwrite('/Users/aks/Documents/Cobotiks/data/to_label/image_masks/adani-western-heights-sky-apartments-apartment-2bhk-1361sqft-1_main.png', img)
# Convert the image to a binary image
binary_img = (img[:, :, 0] > 0) & (img[:, :, 1] > 0) & (img[:, :, 2] > 0)
binary_img = binary_img.astype('uint8') * 255

# Save the binary image as a PNG file
cv2.imwrite('/Users/aks/Documents/Cobotiks/data/to_label/image_masks/adani-western-heights-sky-apartments-apartment-2bhk-1361sqft-1.png', binary_img)