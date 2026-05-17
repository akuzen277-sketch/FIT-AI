# Gunakan image Nginx resmi yang ringan (berbasis Alpine Linux)
FROM nginx:alpine

# Salin semua file dari direktori saat ini ke direktori default Nginx untuk web statis
COPY index.html /usr/share/nginx/html/
COPY style.css /usr/share/nginx/html/
COPY app.js /usr/share/nginx/html/

# Expose port 8080 (Cloud Run secara default menggunakan port 8080)
# Nginx defaultnya berjalan di port 80, jadi kita ubah konfigurasinya agar berjalan di port 8080
# Atau kita bisa membiarkan port 80 dan memberitahu Cloud Run untuk menggunakan port 80.
# Lebih aman menggunakan port 8080 sesuai standar Cloud Run.

# Ubah konfigurasi Nginx untuk mendengarkan port 8080
RUN sed -i 's/listen  *80;/listen 8080;/g' /etc/nginx/conf.d/default.conf

EXPOSE 8080

# Jalankan Nginx saat container dimulai
CMD ["nginx", "-g", "daemon off;"]
