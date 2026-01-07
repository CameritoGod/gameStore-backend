const axios = require('axios');
const { BASE_URL, API_KEY } = require('../api/catalogo');

const generateRandomPrice = () => {
  const min = 5;
  const max = 60;
  return (Math.random() * (max - min) + min).toFixed(2);
};

class GamesController {

  // Juegos para pantalla principal (HOME)
  async gamesAll(req, res) {
    try {
      // Paginación desde el frontend
      const page = req.query.page || 1;
      const pageSize = 12; // ideal para grids

      const response = await axios.get(BASE_URL, {
        params: {
          key: API_KEY,
          page,
          page_size: pageSize,
          ordering: '-rating'
        }
      });

      // Adaptamos la data para el frontend
      const games = response.data.results.map(game => ({
        id: game.id,
        name: game.name,
        image: game.background_image,
        rating: game.rating,
        released: game.released,
        genres: game.genres.map(g => g.name),
        platforms: game.platforms.map(p => p.platform.name)
      }));

      res.status(200).json({
        page: Number(page),
        total: response.data.count,
        games
      });

    } catch (error) {
      res.status(500).json({
        message: 'Error al obtener el catálogo de juegos',
        error: error.message
      });
    }
  }

 // Detalle de un juego por ID
async gameById(req, res) {
  try {
    const { id } = req.params;
    const pageSizeImg = 6;

    // 1️⃣ Obtener datos del juego
    const gameResponse = await axios.get(`${BASE_URL}/${id}`, {
      params: {
        key: API_KEY
      }
    });

    const game = gameResponse.data;

    // 2️⃣ Obtener screenshots
    let screenshots = [];

    try {
      const imgResponse = await axios.get(
        `${BASE_URL}/${id}/screenshots`,
        {
          params: {
            key: API_KEY,
            page_size: pageSizeImg
          }
        }
      );

      screenshots = imgResponse.data.results || [];
    } catch (imgError) {
      console.warn("No se pudieron obtener screenshots");
    }

    // 3️⃣ Armar objeto final
    const gameDetail = {
      id: game.id,
      name: game.name,
      description: game.description_raw,
      image: game.background_image,
      rating: game.rating,
      released: game.released,
      genres: game.genres?.map(g => g.name) || [],
      screenshots: screenshots.map(img => img.image)
    };

    res.status(200).json(gameDetail);

  } catch (error) {
    console.error(error.response?.data || error.message);

    res.status(error.response?.status || 500).json({
      message: `Error al obtener el detalle del juego con id ${req.params.id}`,
      error: error.response?.data || error.message
    });
  }
}


  async gameRecommendations(req, res) {
    try {
      const { genre, limit = 12 } = req.query;

      const response = await axios.get(BASE_URL, {
        params: {
          key: API_KEY,
          ordering: '-rating',
          page_size: 20,
          ratings_count__gte: 300,
          ...(genre && { genres: genre.toLowerCase() }) // filtro opcional
        }
      });

      const games = response.data.results
        .filter(game => game.background_image)
        .slice(0, Number(limit))
        .map(game => ({
          id: game.id,
          title: game.name,
          image: game.background_image,
          rating: game.rating,
          year: game.released?.split("-")[0] || "N/A",
          genres: game.genres.map(g => g.name),
          price: generateRandomPrice()
        }));

      res.status(200).json(games);

    } catch (error) {
      res.status(500).json({
        message: 'Error al obtener juegos recomendados',
        error: error.message
      });
    }
  }


  // Juegos en tendencia (para CardTendencia)
async gamesTrending(req, res) {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        key: API_KEY,
        ordering: '-added', // tendencia
        page_size: 5
      }
    });

    const games = await Promise.all(
      response.data.results.map(async (game) => {
        // Buscar video
        let trailer = null;

        try {
          const videoRes = await axios.get(`${BASE_URL}/${game.id}/movies`, {
            params: { key: API_KEY }
          });

          const video = videoRes.data.results[0];
          if (video) {
            trailer = video.data["720"] || video.data["480"];
          }
        } catch {
          trailer = null;
        }

        return {
          id: game.id,
          title: game.name,
          year: game.released?.split("-")[0] || "N/A",
          genre: game.genres?.[0]?.name || "Unknown",
          rating: game.rating,
          image: game.background_image,
          description: game.slug.replace(/-/g, " "),
          price: generateRandomPrice(), // opcional para tu ecommerce
          trailer
        };
      })
    );

    res.status(200).json(games);

  } catch (error) {
    res.status(500).json({
      message: "Error al obtener juegos en tendencia",
      error: error.message
    });
  }
}

}
module.exports = new GamesController();