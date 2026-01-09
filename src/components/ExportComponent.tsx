"use client";

import { Download, Printer } from "lucide-react";

interface PokemonData {
  id: number;
  name: string;
  caught: boolean;
}

interface ExportComponentProps {
  theme?: "light" | "dark";
  filteredPokemon: PokemonData[];
  pokedexName: string;
  hideImages?: boolean;
}

export function ExportComponent({ theme = "dark", filteredPokemon, pokedexName, hideImages = false }: ExportComponentProps) {
  const isDark = theme === "dark";
  const buttonClass = isDark
    ? "bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
    : "bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300";

  const downloadCSV = () => {
    const headers = ["Index", "Name", "Caught"];

    const rows = filteredPokemon.map((pokemon) => [
      String(pokemon.id),
      pokemon.name,
      pokemon.caught ? "Yes" : "No",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${pokedexName}-pokemon.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = async () => {
    // Preload all images if not hiding them
    if (!hideImages) {
      const imageUrls = filteredPokemon.map(
        (pokemon) =>
          `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`
      );

      try {
        await Promise.all(
          imageUrls.map(
            (url) =>
              new Promise<void>((resolve) => {
                const img = new Image();
                img.onload = () => resolve();
                img.onerror = () => resolve(); // Resolve even on error to continue
                img.src = url;
              })
          )
        );
      } catch (error) {
        console.error("Error preloading images:", error);
      }
    }

    const printWindow = window.open("", "", "width=1200,height=800");
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print ${pokedexName}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Outfit', sans-serif;
              background: white;
              padding: 20px;
            }
            .cards-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 20px;
              margin-bottom: 40px;
            }
            .card {
              border: 3px solid #000;
              border-radius: 8px;
              padding: 15px;
              text-align: center;
              background: #f9f9f9;
              page-break-inside: avoid;
              height: 371px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
            }
            .card-image {
              width: 100%;
              height: 143px;
              object-fit: contain;
              margin-bottom: auto;
            }
            .card-index {
              font-size: 32px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .card-name {
              font-size: 36px;
              font-weight: bold;
              margin-bottom: 5px;
              text-transform: capitalize;
            }
            @media print {
              body {
                padding: 10px;
              }
              .cards-grid {
                gap: 10px;
              }
              .card {
                padding: 10px;
              }
            }
          </style>
        </head>
        <body>
          <div class="cards-grid">
            ${filteredPokemon
              .map(
                (pokemon) => `
              <div class="card">
                ${
                  !hideImages
                    ? `<img class="card-image" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png" alt="${pokemon.name}" />`
                    : ""
                }
                <div class="card-name">${pokemon.name}</div>
                <div class="card-index">#${String(pokemon.id).padStart(3, "0")}</div>
              </div>
            `
              )
              .join("")}
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <div className="flex items-center gap-3">
      {/* Export CSV Button */}
      <button
        onClick={downloadCSV}
        className={`flex items-center gap-2 px-4 py-3 border border-solid rounded-xl transition flex items-center gap-2 text-sm font-semibold ${buttonClass} hover:border-red-500`}
      >
        <Download size={18} />
        <span className="hidden sm:inline">Export CSV</span>
      </button>

      {/* Print Button */}
      <button
        onClick={handlePrint}
        className={`flex items-center gap-2 px-4 py-3 border border-solid rounded-xl transition flex items-center gap-2 text-sm font-semibold ${buttonClass} hover:border-red-500`}
      >
        <Printer size={18} />
        <span className="hidden sm:inline">Print</span>
      </button>
    </div>
  );
}
