const viaCepApi = (req, res) => {
    let dadosApi;
    const {
        cep
    } = req;

    try {
        const url = `viacep.com.br/ws/${cep}/json/`;
        fetch(url)
            .then(resp => resp.json())
            .then(data => {

                dadosApi = data;

            })
            .catch(error => {
                console.error('Erro ao consultar o CEP:', error.message);
            });

            
            return res.status(200).json(dadosApi);
        } catch (error) {
            res.status(500).json({ mensagem: `${error.message}` });
        }
        
}

module.exports = viaCepApi;