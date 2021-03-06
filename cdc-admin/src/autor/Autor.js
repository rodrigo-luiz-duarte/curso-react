import React, { Component } from 'react';
import $ from 'jquery';
import InputCustomizado from '../componentes/InputCustomizado';
import BotaoSubmitCustomizado from '../componentes/BotaoSubmitCustomizado';
import PubSub from 'pubsub-js';
import TratadorErro from '../utils/TratadorErro';

class FormularioAutor extends Component {

    constructor() {

        super();
        this.state = {nome:'',email:'', senha:''};
        this.enviaForm = this.enviaForm.bind(this);
        /*this.setNome = this.setNome.bind(this);
        this.setEmail = this.setEmail.bind(this);
        this.setSenha = this.setSenha.bind(this);*/
    }

    render() {
        return(
            <div className="pure-form pure-form-aligned">
                  
                <form className="pure-form pure-form-aligned" onSubmit={this.enviaForm} method="post">
                <InputCustomizado id="nome" type="text" name="nome" label="Nome" value={this.state.nome} onChange={this.salveValorElemento.bind(this, 'nome')} />                                              
                <InputCustomizado id="email" type="email" name="email" label="Email" value={this.state.email} onChange={this.salveValorElemento.bind(this, 'email')} />
                <InputCustomizado id="senha" type="password" name="senha" label="Senha" value={this.state.senha} onChange={this.salveValorElemento.bind(this, 'senha')} />
                <BotaoSubmitCustomizado label="Gravar"/>
                </form>
            </div> 
        );
    } 
    
    enviaForm(evento) {

        evento.preventDefault();
    
        $.ajax({
            url:"http://localhost:8080/api/autores",
            contentType: 'application/json',
            dataType:'json',
            type:'post',
            data: JSON.stringify({nome: this.state.nome, email: this.state.email, senha: this.state.senha}),
            success: novaLista => {

                console.log("enviado com sucesso");
              
                // Publica no tópico atualiza-lista-autores que houve
                // atualização da lista.
                PubSub.publish('atualiza-lista-autores',novaLista);

                this._limpaCampos();
            },
            error: resposta => {
                console.log(resposta);
                if(resposta.status === 400) {
                    TratadorErro.publicaErros(resposta.responseJSON);
                }
            },
            beforeSend: () => {
                PubSub.publish("limpa-erros",{});
            }
          }
        );
    }
    
    salveValorElemento(nomeInput, evento) {
        this.setState({[nomeInput]:evento.target.value});
    }

    /*setNome(evento){
        this.setState({nome:evento.target.value});
    }
    
    setEmail(evento){
        this.setState({email:evento.target.value});
    }
    
    setSenha(evento){
        this.setState({senha:evento.target.value});
    }*/

    _limpaCampos() {

        this.setState({nome: '', email: '', senha: ''});
    }
}

class TabelaAutores extends Component {

    render() {
        return (
            <div>            
                <table className="pure-table">
                <thead>
                    <tr>
                    <th>Nome</th>
                    <th>email</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        this.props.lista.map(autor =>{
                            return (
                            <tr key={autor.id}>
                                <td>{autor.nome}</td>
                                <td>{autor.email}</td>
                            </tr>
                            );
                        })
                    }
                </tbody>
                </table> 
            </div>
        );
    }
}

// Componente criado para permitir que os componentes
// compartilhassem dados (ex: lista de autores)
export default class AutorBox extends Component {

    constructor() {
        super();
        this.state = { lista: []};
    }
    
    componentDidMount() {

        $.ajax({
            url:"http://localhost:8080/api/autores",
            dataType: 'json',
            success: resposta => {
                console.log(resposta);
                this.setState({lista:resposta});
            }
            }
        );

        // Assina o tópico atualiza-lista-autores para receber notificações
        // de novos autores incluídos na lista e atualizar a lista na tela.
        PubSub.subscribe('atualiza-lista-autores', (topico,novaLista) => {
            this._atualizaListagem(novaLista);
        });
    }

    render() {
      return (
        <div>
            <div className="header">
                <h1>Cadastro de autores</h1>
            </div>
            <br/>
            <div className="content" id="content">
                <FormularioAutor/>
                <TabelaAutores lista={this.state.lista}/>
            </div>
        </div>
      );
    }

    _atualizaListagem(novaLista) {
        this.setState({lista:novaLista});
    }
}