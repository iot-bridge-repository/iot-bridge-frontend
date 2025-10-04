export default function App() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">📘 Dokumentasi Aplikasi IoT Bridge</h1>

      {/* Pendahuluan */}
      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">1. Pendahuluan</h2>
        <p className="text-gray-700">
          Selamat datang di aplikasi IoT kami. Aplikasi ini memungkinkan Anda 
          untuk mengelola perangkat, memantau data sensor secara real-time, dan melihat laporan data historis.
        </p>
      </section>

      {/* Navigasi Utama */}
      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">2. Navigasi Utama</h2>
        <p className="text-gray-700">Setelah login, Anda dapat mengakses beberapa menu utama:</p>
        <ul className="list-disc list-inside text-gray-700 ml-4">
          <li><strong>Dokumentasi:</strong> Petunjuk penggunaan aplikasi.</li>
          <li><strong>Organisasi:</strong> Daftar organisasi yang Anda miliki.</li>
          <li><strong>Notifikasi:</strong> Daftar notifikasi perangkat.</li>
          <li><strong>Profil:</strong> Mengubah data akun dan pengaturan profil Anda.</li>
        </ul>
      </section>

      {/* Organisasi */}
      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">3. Organisasi</h2>
        <p className="text-gray-700">
          Buat organisasi untuk mengelola perangkat IoT bersama anggota lainnya.
        </p>
        <ol className="list-decimal list-inside text-gray-700">
          <li>Buka menu <strong>Organisasi</strong> dari navigasi utama.</li>
          <li>Klik tombol <strong>+ Ajukan Organisasi</strong> lalu masukkan nama organisasi.</li>
          <li>Hubungi Admin System untuk memverifikasi organisasi.</li>
          <li>Setelah terverifikasi, organisasi dapat diakses.</li>
        </ol>
      </section>

      {/* Navigasi Organisasi */}
      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">4. Navigasi Organisasi</h2>
        <p className="text-gray-700">
          Setelah organisasi terverifikasi, Anda dapat mengakses menu berikut:
        </p>
        <ul className="list-disc list-inside text-gray-700 ml-4">
          <li><strong>Dashboard:</strong> Berisi widget boxes untuk menampilkan data real-time.</li>
          <li><strong>Devices:</strong> Daftar perangkat yang dimiliki organisasi.</li>
          <li><strong>Notification Events:</strong> Notifikasi berdasarkan data perangkat.</li>
          <li><strong>Profil:</strong> Informasi dan pengaturan organisasi.</li>
          <li><strong>Data Reports:</strong> Data historis dari perangkat IoT.</li>
        </ul>
      </section>

      {/* Devices */}
      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">5. Devices</h2>
        <ul className="list-disc list-inside text-gray-700 ml-4">
          <li>Buka menu <strong>Organisasi</strong> dari navigasi utama.</li>
          <li>Pilih organisasi anda yang telah terverifikasi.</li>
          <li>Buka menu <strong>Devices</strong></li>
          <li>Untuk menambahkan perangkat baru, klik tombol <strong>+ Tambah Perangkat</strong> dan masukkan nama perangkat.</li>
          <li>Setiap perangkat memiliki <code>auth_code</code> yang digunakan sebagai topic MQTT untuk mengirim data.</li>
          <li>Contoh kode pada perangkat IoT:</li>
        </ul>
        <p>Contoh kode untuk menghubungkan ke MQTT:</p>
        <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
          <code>{`
            #include <PubSubClient.h>
            const char* mqtt_server = "iotbridge.duckdns.org";
            const int mqtt_port = 8883;
            const char* mqtt_user = "iot_bridge";         // pastikan user iot_bridge
            const char* mqtt_password = "iot_bridge123";  // pastikan password iot_bridge123
            const char* topic_publish = "auth-code/.."; // Ganti dengan auth code anda


            espClient.setInsecure();
            client.setServer(mqtt_server, mqtt_port);
            while (!client.connected()) {
              Serial.print("Menghubungkan ke MQTT...");
              if (client.connect("ESP32Client", mqtt_user, mqtt_password)) {
                Serial.println("Terhubung");
              } else {
                Serial.print("Gagal, rc=");
                Serial.println(client.state());
                delay(5000);
              }
            }
          `}</code>
        </pre>

        <p className="mt-4">Contoh kode untuk mengirim data JSON ke server:</p>
        <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
          <code>{`
            // Data yang dikirim harus berupa JSON
            String payload = "{";
            payload += "\\"V1\\":" + String(tempC, 1); // perhatikan Pin nya
            payload += ",\\"V2\\":" + String(tdsValue, 0);
            payload += ",\\"V3\\":" + String(pHValue, 2);
            payload += ",\\"V4\\":" + String(average, 3);
            payload += "}";

            Serial.println("Publish JSON: " + payload);
            client.publish(topic_publish, payload.c_str());
          `}</code>
        </pre>
      </section>

      {/* Dashboard */}
      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">4. Dashboard</h2>
        <p className="text-gray-700">
          Untuk melihat data real-time, Anda dapat mengakses menu <strong>Dashboard</strong>.
        </p>
        <ol className="list-decimal list-inside text-gray-700">
          <li>Buka menu <strong>Organisasi</strong> dari navigasi utama.</li>
          <li>Pilih organisasi anda yang telah terverifikasi.</li>
          <li>Pada halaman dashboard anda dapat membuat widget boxes untuk menampilkan data real-time.</li>
          <li>Buat widget boxes sesuaikan perangkat dan pin untuk melihat data real-time.</li>
        </ol>
      </section>

      {/* Notifikasi Event */}
      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">6. Notifikasi Event</h2>
        <p className="text-gray-700">
          Fitur <strong>Notifikasi Event</strong> digunakan untuk memberikan peringatan atau informasi otomatis berdasarkan data yang dikirimkan oleh perangkat. 
          Dengan fitur ini, Anda dapat memantau kondisi tertentu, seperti batas nilai sensor atau status perangkat.
        </p>
        <ol className="list-decimal list-inside text-gray-700">
          <li>Buka menu <strong>Organisasi</strong> dari navigasi utama.</li>
          <li>Pilih organisasi Anda yang sudah terverifikasi.</li>
          <li>Buka menu <strong>Notification Event</strong>.</li>
          <li>Klik tombol <strong>+ Tambah Event</strong>.</li>
          <li>Pilih perangkat dan pin yang ingin dipantau.</li>
          <li>Isi <strong>Subject</strong> dan <strong>Message</strong> untuk notifikasi.</li>
          <li>Atur <strong>Threshold</strong> (batas nilai) dan <strong>Comparison Type</strong> (jenis perbandingan, misalnya lebih besar dari, sama dengan, dll).</li>
          <li>Tentukan status event: <strong>Active</strong> (aktif) atau <strong>Inactive</strong> (nonaktif).</li>
          <li>Klik <strong>Simpan</strong> untuk menyelesaikan.</li>
          <li>
            Jika nilai pin pada perangkat memenuhi syarat sesuai <strong>Threshold</strong> dan <strong>Comparison Type</strong>, 
            maka notifikasi akan muncul pada tab <strong>Notifikasi</strong>.
          </li>
        </ol>
        <p className="text-gray-700 mt-2">
          Notifikasi dapat ditampilkan langsung di aplikasi atau dikirim melalui email, tergantung pada konfigurasi yang Anda gunakan.
        </p>
      </section>

      {/* Organization Profile */}
      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">7. Profile</h2>
        <p className="text-gray-700">
          Halaman <strong>Profile</strong> digunakan untuk mengatur informasi organisasi 
          dan mengelola anggota yang terdaftar di dalam organisasi.
        </p>
        <ol className="list-decimal list-inside text-gray-700">
          <li>Buka menu <strong>Profile</strong> dari navigasi utama.</li>
          <li>Di tab <strong>Organisasi</strong>, Anda dapat mengubah nama organisasi, deskripsi, dan informasi penting lainnya.</li>
          <li>Di tab <strong>Anggota</strong>, Anda dapat menambahkan, menghapus, atau mengubah role anggota organisasi.</li>
        </ol>

        <h5 className="text-xl font-semibold mt-4 mb-2">Role dalam Organisasi</h5>
        <ul className="list-disc list-inside text-gray-700 ml-6">
          <li>
            <strong>Admin Organisasi</strong> → Bertanggung jawab penuh atas organisasi, dapat mengatur anggota, 
            mengatur role, serta mengelola semua perangkat dan data.
          </li>
          <li>
            <strong>Operator</strong> → Dapat mengatur perangkat yang terhubung, membuat widget, dan mengatur tampilan data 
            di dashboard. Namun, tidak bisa menambah atau menghapus anggota.
          </li>
          <li>
            <strong>Viewer</strong> → Hanya dapat melihat data yang ditampilkan di dashboard dan laporan. 
            Tidak bisa melakukan perubahan konfigurasi.
          </li>
        </ul>
      </section>

      {/* Footer */}
      <section className="mb-6">
        <p className="text-gray-500 text-sm">
          © 2025 Aplikasi IoT. Semua hak cipta dilindungi.
        </p>
      </section>
    </div>
  );
}
