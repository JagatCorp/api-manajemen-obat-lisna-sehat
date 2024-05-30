const db = require("../models");
const Obat = db.obat;
const Satuan = db.satuan;
const TransaksiObatMasuk = db.transaksi_obat_masuk;
const TransaksiObatKeluar = db.transaksi_obat_keluar;
const Principle = db.principle;
const fs = require("fs");
const pathModule = require("path"); // Ubah nama variabel menjadi pathModule
// const Op = db.Sequelize.Op;
// const { Op } = require("sequelize");
const JSONAPISerializer = require("jsonapi-serializer").Serializer;

const { Op } = require("sequelize");

const multer = require("multer");

// Create and Save a new obat

exports.create = async (req, res) => {
  try {
    // Pastikan bahwa semua data yang diperlukan ada
    const { nama_obat, satuan_box_id, satuan_sat_id, qty_sat, stok, harga, disc_principle } =
      req.body;
    if (
      !nama_obat ||
      !satuan_box_id ||
      !satuan_sat_id ||
      !qty_sat ||
      !harga ||
      !stok ||
      !disc_principle ||
      !req.file
    ) {
      return res.status(400).send({ message: "All fields are required!" });
    }

    // Proses file gambar yang diunggah
    const imageName = req.file.filename;
    // // local
    // const imageUrl = `${req.protocol}://${req.get("host")}/obat/${imageName}`;
    // production
    const imageUrl = `https://api.lisnasehat.online/obat/${imageName}`;

    // Pastikan bahwa satuan_box dan satuan_sat yang diberikan ada dalam database
    const satuan_box_data = await Satuan.findByPk(satuan_box_id);
    if (!satuan_box_data) {
      return res.status(404).send({ message: "Satuan box not found!" });
    }

    const satuan_sat_data = await Satuan.findByPk(satuan_sat_id);
    if (!satuan_sat_data) {
      return res.status(404).send({ message: "Satuan sat not found!" });
    }

    // Buat objek obat dengan informasi gambar
    const obat = {
      nama_obat,
      satuan_box_id,
      satuan_sat_id,
      qty_sat,
      harga,
      stok,
      disc_principle,
      gambar_obat: imageName,
      urlGambar: imageUrl,
    };

    // Simpan obat ke dalam database
    const createdObat = await Obat.create(obat);
    res.status(200).send(createdObat);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message || "Error creating obat." });
  }
};

// code benar tapi salah
exports.findAll = async (req, res) => {
  try {
    // Mendapatkan nilai halaman dan ukuran halaman dari query string (default ke halaman 1 dan ukuran 10 jika tidak disediakan)
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    // Menghitung offset berdasarkan halaman dan ukuran halaman
    const offset = (page - 1) * pageSize;
    const keyword = req.query.keyword || "";

    // Query pencarian
    const searchQuery = {
      where: {
        [Op.or]: [{ nama_obat: { [Op.like]: `%${keyword}%` } }],
      },
      limit: pageSize,
      offset: offset,
      include: [
        {
          model: Satuan,
          as: "satuan_box",
          attributes: ["nama_satuan"],
        },
        {
          model: Satuan,
          as: "satuan_sat",
          attributes: ["nama_satuan"],
        },
      ],
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    };

    const obat = await Obat.findAll(searchQuery);
    const totalCount = await Obat.count(searchQuery);
    // Menghitung total jumlah obat
    // const totalCount = await Obat.count();

    // Menghitung total jumlah halaman berdasarkan ukuran halaman
    const totalPages = Math.ceil(totalCount / pageSize);

    // Kirim response dengan data JSON dan informasi pagination
    res.send({
      data: obat,
      currentPage: page,
      totalPages: totalPages,
      pageSize: pageSize,
      totalCount: totalCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error retrieving obats." });
  }
};

// Find a single admin with an id

exports.findOne = async (req, res) => {
  const id = req.params.id;

  try {
    const obat = await Obat.findByPk(id);

    if (!obat) {
      return res.status(404).send({
        message: `Cannot find obat with id=${id}.`,
      });
    }

    const serializedObat = obatSerializer.serialize(obat);

    res.send(serializedObat);
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: `Error retrieving obat with id=${id}`,
    });
  }
};

// Update an Obat by the id in the request
exports.update = async (req, res) => {
  const id = req.params.id;
  const file = req.file;

  try {
    let obatData = req.body;

    // Jika pengguna mengunggah gambar baru, gunakan gambar yang baru diupdate
    if (file) {
      const imageName = file.filename;
      // local
      // const imageUrl = `${req.protocol}://${req.get("host")}/obat/${
      //   file.filename
      // }`;
      // production
      const imageUrl = `https://api.lisnasehat.online/obat/${file.filename}`;

      obatData = {
        ...obatData,
        gambar_obat: imageName,
        urlGambar: imageUrl,
      };
    }

    // Temukan obat yang akan diupdate
    const obat = await Obat.findByPk(id);

    const filePath = pathModule.join(
      __dirname,
      "../../public/assets/images/obat/",
      obat.gambar_obat
    );

    try {
      fs.unlinkSync(filePath);
      console.log(`Deleted the file under ${filePath}`);
    } catch (err) {
      console.log("An error occurred: ", err.message);
    }

    if (!obat) {
      return res.status(404).send({ message: `Obat with id=${id} not found` });
    }

    // Perbarui data obat dengan data baru, termasuk data yang tidak berubah
    await obat.update(obatData);

    res.send({
      message: "Obat berhasil diubah.",
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Delete a obat with the specified id in the request
exports.delete = async (req, res) => {
  const id = req.params.id;

  const obat = await Obat.findByPk(id);

  const filePath = pathModule.join(
    __dirname,
    "../../public/assets/images/obat/",
    obat.gambar_obat
  );

  try {
    fs.unlinkSync(filePath);
    console.log(`Deleted the file under ${filePath}`);
  } catch (err) {
    console.log("An error occurred: ", err.message);
  }

  Obat.destroy({
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "obat was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete obat with id=${id}. Maybe obat was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete obat with id=" + id,
      });
    });
};

// Delete all obats from the database.
exports.deleteAll = (req, res) => {
  Obat.destroy({
    where: {},
    truncate: false,
  })
    .then((nums) => {
      res.send({
        message: `${nums} obats were deleted successfully!`,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while removing all obats.",
      });
    });
  };
  
  
  // code benar tapi salah
  exports.findExcel = async (req, res) => {
    try {
      const urutBulan = {
        "Januari": '01',
        "Februari": '02',
        "Maret": '03',
        "April": '04',
        "Mei": '05',
        "Juni": '06',
        "Juli": '07',
        "Agustus": '08',
        "September": '09',
        "Oktober": '10',
        "November": '11',
        "Desember": '12'
    };
      
      const { bulan, tahun } =
      req.body;

      
    // Query pencarian
    const queryPencarian = {
      where: {
        // [Op.or]: [{ nama_obat: { [Op.like]: `%${kataKunci}%` } }],
      },
      include: [
        {
          model: Satuan,
          as: "satuan_box",
          attributes: ["nama_satuan"],
        },
        {
          model: Satuan,
          as: "satuan_sat",
          attributes: ["nama_satuan"],
        },
      ],
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    };

    const obat = await Obat.findAll(queryPencarian);
    const data = [];

    for (let index = 0; index < obat.length; index++) {
      const item = obat[index];
      let prinsipal = ''; // Reset prinsipal untuk setiap item
      let tanggal = [];

      let transaksiObatMasuk = await TransaksiObatMasuk.findAll({
        where: {
          obat_id: item.id,
          createdAt: {
            // [Op.gte]: new Date('2024-05-01'),
            // [Op.lte]: new Date('2024-05-31')
            [Op.gte]: new Date(`${tahun}-${urutBulan[bulan]}-01`),
            [Op.gte]: new Date(`${tahun}-${urutBulan[bulan]}-31`),
          }
        },
        include: [
          {
            model: Principle,
            attributes: ["nama_instansi"],
          },
        ],
        order: [
          ['createdAt', 'ASC']
        ]
      });

      let transaksiObatKeluar = await TransaksiObatKeluar.findAll({
        where: {
          obat_id: item.id,
          createdAt: {
            // [Op.gte]: new Date('2024-05-01'),
            // [Op.lte]: new Date('2024-05-31')
            [Op.gte]: new Date(`${tahun}-${urutBulan[bulan]}-01`),
            [Op.gte]: new Date(`${tahun}-${urutBulan[bulan]}-31`),
          }
        },
        include: [
          // {
          //   model: Principle,
          //   attributes: ["nama_instansi"],
          // },
        ],
        order: [
          ['createdAt', 'ASC']
        ]
      });

      // Menggabungkan dua array
      let semuaTransaksi = [...transaksiObatMasuk, ...transaksiObatKeluar];

      // Urutkan berdasarkan createdAt
      semuaTransaksi.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      // Dapatkan createdAt terawal dan stok_obat_sebelum jika tersedia
      const transaksiTerawal = semuaTransaksi.length > 0 ? semuaTransaksi[0] : null;
      const stokObatSebelum = transaksiTerawal ? transaksiTerawal.stok_obat_sebelum : null;

      // Dapatkan transaksi terakhir
      const transaksiTerakhir = semuaTransaksi.length > 0 ? semuaTransaksi[semuaTransaksi.length - 1] : null;
      const stokObatTerakhir = transaksiTerakhir ? transaksiTerakhir.stok_obat_sesudah : null;
      
      // Dapatkan tanggal awal dan akhir bulan
      // const tanggalMulai = new Date('2024-05-01');
      // const tanggalAkhir = new Date('2024-05-31');
      const tanggalMulai = new Date(`${tahun}-${urutBulan[bulan]}-01`);
      const tanggalAkhir = new Date(`${tahun}-${urutBulan[bulan]}-31`);
      

      // Inisialisasi objek untuk menyimpan data terakumulasi
      const dataTerakumulasi = {};

      // Iterasi setiap tanggal dalam bulan
      for (let tanggal = new Date(tanggalMulai); tanggal <= tanggalAkhir; tanggal.setDate(tanggal.getDate() + 1)) {
        // Ekstrak hari dari tanggal
        const hari = tanggal.getDate();

        // Inisialisasi entri tanggal jika belum ada
        if (!dataTerakumulasi[hari]) {
          dataTerakumulasi[hari] = { M: 0, K: 0 };
        }
      }

      let jumlahM = 0;
      let jumlahK = 0;

      // Iterasi setiap transaksi
      semuaTransaksi.forEach(transaksi => {
        // Ekstrak bagian tanggal dari timestamp createdAt
        const tanggal = new Date(transaksi.createdAt).getDate();

        // Perbarui nilai M atau K berdasarkan jenis transaksi
        if (transaksi instanceof TransaksiObatMasuk) {
          dataTerakumulasi[tanggal].M += transaksi.jml_obat; // Asumsikan amount adalah atribut untuk jumlah transaksi
          jumlahM += transaksi.jml_obat;
        } else if (transaksi instanceof TransaksiObatKeluar) {
          dataTerakumulasi[tanggal].K += transaksi.jml_obat; // Asumsikan amount adalah atribut untuk jumlah transaksi
          jumlahK += transaksi.jml_obat;
        }
      });

      transaksiObatMasuk.forEach((masuk) => {
        // Periksa jika nama_instansi sudah termasuk dalam string prinsipal
        if (!prinsipal.includes(masuk.principle.nama_instansi)) {
          prinsipal += masuk.principle.nama_instansi + ';';
        }
      });

      // PEMBELIAN
      // harga asli atau (dpp / box)
      let hrg_dpp = item.harga;
      // dikali dengan disc_principle
      let set_disc_principle = hrg_dpp * item.disc_principle / 100;
      // harga dpp - disc_principle
      let set_harga_disc = hrg_dpp - set_disc_principle;
      // lalu dikali 11% ppn
      let harga_ppn = set_harga_disc * 11 / 100;
      // harga setelah ppn
      let set_harga_ppn = set_harga_disc + harga_ppn;
      // harga satuan (pembelian)
      let hrg_sat_pem = set_harga_ppn / item.qty_sat;
      // jumlah (pembelian)
      let jumlah_pem = hrg_sat_pem * jumlahM;
      
      
      // PENJUALAN
      // hna satuan = hrg_dpp / qty_satuan
      let set_hna_satuan = hrg_dpp / item.qty_sat;
      // dikali ppn 11%
      let ppn11 = set_hna_satuan * 11 / 100;
      // harga setelah ppn
      let set_hna_ppn = set_hna_satuan + ppn11;
      // dikali margin 15%
      let harga_margin = set_hna_ppn * 15 / 100;
      // hna + ppn + margin 15%
      let hna_ppn_margin = set_hna_ppn + harga_margin;
      // pembelian - penjualan
      let pem_pen = hna_ppn_margin - set_hna_satuan;
      // disc_principle
      let disc_pem_principle = set_hna_satuan * item.disc_principle / 100;
      // profit sat
      let profit_sat_pem = pem_pen + disc_pem_principle;
      // profit total pembelian
      let profit_total_pem = profit_sat_pem * jumlahK;
      let total_saldo = stokObatTerakhir * hna_ppn_margin;
      
      // jumlah_pen
      let jumlah_pen = hna_ppn_margin * jumlahK;
      // profit_sat
      let profit_sat = hna_ppn_margin - hrg_sat_pem;

      data.push({
        no: index + 1,
        namaBarang: item.nama_obat,
        prinsipal: prinsipal,
        satuan_box: item.satuan_box.nama_satuan,
        qtySat: item.qty_sat,
        satuan_sat: item.satuan_sat.nama_satuan,
        stok: stokObatSebelum,
        tanggal: dataTerakumulasi,
        jumlahStok: {
          M: jumlahM,
          K: jumlahK,
        },
        sisaStok: stokObatTerakhir ?? 0,
        hargaDPPBox: hrg_dpp,
        disc: set_disc_principle,
        per_disc: item.disc_principle,
        harga_disc: set_harga_disc,
        ppn_pem: harga_ppn,
        hrg_set_ppn: set_harga_ppn,
        hrg_sat_pem: hrg_sat_pem,
        jumlah_pem: jumlah_pem,
        hrg_sat_pen: parseInt(hna_ppn_margin),
        jumlah_pen: parseInt(jumlah_pen),
        profit_sat: parseInt(profit_sat),
        harga_asli: hrg_dpp,
        hna_satuan: parseInt(set_hna_satuan),
        ppn11: parseInt(ppn11),
        set_hna_ppn: parseInt(set_hna_ppn),
        per_margin: '15',
        rp_margin: parseInt(harga_margin),
        hna_ppn_margin: parseInt(hna_ppn_margin),
        pem_pen: parseInt(pem_pen),
        disc_pem: item.disc_principle,
        disc_pem_principle: parseInt(disc_pem_principle),
        profit_sat_pem: parseInt(profit_sat_pem),
        profit_total_pem: parseInt(profit_total_pem),
        hrg_penjualan: parseInt(hna_ppn_margin),
        total_saldo: parseInt(total_saldo)
      });
    }

    // Kirim response dengan data JSON dan informasi pagination
    res.send({
      data: data,
    });

  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error retrieving obats." });
  }
};
