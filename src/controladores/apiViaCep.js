const axios = require('axios');

const viaCepApi = async (req, res) => {
    const { cep } = req.params; // Corrigido para req.params, sem .cep

    try {
        const url = `https://viacep.com.br/ws/${cep}/json/`;
        const response = await axios.get(url);
        const dadosApi = response.data;

        if (dadosApi.erro) {
            return res.status(404).json({ mensagem: 'CEP não encontrado' });
        }

        return res.status(200).json(dadosApi);
    } catch (error) {
        console.error('Erro ao consultar o CEP:', error.message);
        return res.status(500).json({ mensagem: error.message });
    }
}

module.exports = viaCepApi;


