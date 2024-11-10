const home = async (req,res) => {
    try {
        return await res.status(200).json({mensagem: 'Hello'});
    } catch (error) {
        return await res.status(500).json({mensagem: `${error.message}`})
    }

}

module.exports = home;