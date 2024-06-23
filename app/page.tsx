"use client";

import { useState } from "react";
import { pengisiSuara } from "./constants/dataSuara";
import Image from "next/image";

export default function Home() {
  const [selectVoice, setSelectVoice] = useState(false);
  const [name, setName] = useState("Pilih pengisi suara");
  const [value, setValue] = useState("");
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConvert = async () => {
    if (!inputText) {
      setError("Mohon masukkan teks terlebih dahulu.");
      return;
    }
    if (!value) {
      setError("Mohon pilih pengisi suara terlebih dahulu.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputText,
          selectVoice: value,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Mendapatkan blob dari response
      const blob = await response.blob();

      // Membuat URL untuk blob
      const url = window.URL.createObjectURL(blob);

      // Membuat elemen anchor untuk download
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = "output.mp3";

      // Menambahkan ke DOM, mengklik, dan menghapus
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error:", error);
      setError("Terjadi kesalahan saat mengkonversi teks ke suara.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="w-full h-screen mx-auto px-4 py-4 flex flex-col md:flex-col">
      <div className="flex flex-col items-start md:flex-row gap-1 md:gap-4 md:items-end">
        <h1 className="text-2xl font-bold tracking-wide">
          Aplikasi Text to Speech
        </h1>
        <p className="text-sm">
          (Copas text ke kolom di bawah, pilih pengisi suara, lalu convert.)
        </p>
      </div>

      <div className="flex-col md:flex-row flex w-full h-screen pt-3">
        <textarea
          placeholder="Masukkan text disini"
          className="focus:outline-none resize-none h-64 md:h-full bg-white outline-1 stroke-blue-500 text-black px-5 py-3 rounded-lg w-full mb-4 md:mb-0"
          onChange={(e) => setInputText(e.target.value)}
          value={inputText}
        ></textarea>
        <div className="w-full md:w-3/12 md:ps-5 flex flex-col gap-4">
          <div className="inline-block text-left w-full relative">
            <button
              type="button"
              className="bg-white text-black text-sm flex flex-row w-full rounded-md h-11 items-center justify-between px-3"
              id="menu-button"
              aria-expanded={selectVoice}
              aria-haspopup="true"
              onClick={() => setSelectVoice(!selectVoice)}
            >
              {name}
              <svg
                className="-mr-1 h-5 w-5 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            {selectVoice && (
              <div className="absolute mt-[1px] w-full bg-white z-10">
                <div
                  className="py-1"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="menu-button"
                  tabIndex={-1}
                >
                  {pengisiSuara.map((talent, index) => (
                    <div
                      key={talent.value}
                      onClick={() => {
                        setName(talent.nama);
                        setValue(talent.value);
                        setSelectVoice(false);
                      }}
                    >
                      <div className="flex flex-row items-center px-2 py-2">
                        <Image
                          src={talent.image}
                          alt={`Gambar ${talent.nama}`}
                          width={30}
                          height={30}
                        />
                        <a
                          href="#"
                          className="block ps-3 text-sm text-gray-700"
                          role="menuitem"
                          tabIndex={-1}
                          id={`menu-item-${index}`}
                        >
                          {talent.nama}
                        </a>
                      </div>
                      {index < pengisiSuara.length - 1 && (
                        <div className="border-[1px] border-gray-100 mx-2" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            className={`bg-blue-500 hover:bg-blue-600 text-white w-full h-11 rounded-md transition ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handleConvert}
            disabled={isLoading}
          >
            {isLoading ? "Memproses..." : "Convert to MP3"}
          </button>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
      </div>
    </main>
  );
}
