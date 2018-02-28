import PubSub from 'pubsub-js';

export default class TratadorErros {

    static publicaErros(erros) {

        if (erros.errors) {

            erros.errors.forEach(erro => {
    
                console.log('Erro: ', erro);
                PubSub.publish("erro-validacao",erro);
    
            });
        }
    }

}