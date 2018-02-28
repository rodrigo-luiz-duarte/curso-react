import React, { Component } from 'react';
import $ from 'jquery';
import InputCustomizado from '../componentes/InputCustomizado';
import BotaoSubmitCustomizado from '../componentes/BotaoSubmitCustomizado';
import PubSub from 'pubsub-js';
import TratadorErro from '../utils/TratadorErro';


class FormularioLivro extends Component {

    constructor() {

      super();
      this.state = {titulo:'',preco:'',autorID:''};
      this.enviaForm = this.enviaForm.bind(this);
      this.setTitulo = this.setTitulo.bind(this);
      this.setPreco = this.setPreco.bind(this);
      this.setAutorId = this.setAutorId.bind(this);
    }

    render() {
        return (
            <div className="pure-form pure-form-aligned">
                <form className="pure-form pure-form-aligned" onSubmit={this.enviaForm} method="post">
                    <InputCustomizado id="titulo" type="text" name="titulo" value={this.state.titulo} onChange={this.setTitulo} label="Título"/>                                              
                    <InputCustomizado id="preco" type="text" name="preco" value={this.state.preco} onChange={this.setPreco} label="Preço"/>                                              
                    <div className="pure-control-group">
                        <label htmlFor="autorId">Autor</label>
                        <select value={this.state.autorId} name="autorId" id="autorID" onChange={this.setAutorId} >
                            <option value="">Selecione autor</option>
                            {
                                this.props.autores.map(autor => {
                                    console.log(autor.name);
                                    return <option value={autor.id} key={autor.id}>{autor.nome}</option>
                                })
                            }
                        </select>
                    </div>  
                    <BotaoSubmitCustomizado label="Gravar"/>
                </form>
            </div>
        );
    }

    enviaForm(evento) {

            evento.preventDefault();

            $.ajax({
            url:'http://localhost:8080/api/livros',
            contentType:'application/json',
            dataType:'json',
            type:'post',
            data: JSON.stringify({titulo:this.state.titulo,preco:this.state.preco,autorId:this.state.autorId}),
            success: novaListagem => {
                PubSub.publish('atualiza-lista-livros',novaListagem);
                this.setState({titulo:'',preco:'',autorId:''});
            },
            error: resposta => {

                console.log(resposta);
                if(resposta.status === 400) {
                    TratadorErro.publicaErros(resposta.responseJSON);
                }
            },
            beforeSende:function(){
                PubSub.publish("limpa-erros",{});
            }
        });
    
    }

    setTitulo(evento){
        this.setState({titulo:evento.target.value});
    }
    
    setPreco(evento){
        this.setState({preco:evento.target.value});
    }
    
    setAutorId(evento){
        this.setState({autorId:evento.target.value});
    }

}
    

class TabelaLivros extends Component {

    render() {
        return (
            <div>
                <table className="pure-table">
                <thead>
                    <tr>
                    <th>Título</th>
                    <th>Preço</th>
                    <th>Autor</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        this.props.lista.map(livro => {
                            return (
                                <tr key={livro.id}>
                                    <td>{livro.titulo}</td>
                                    <td>{livro.preco}</td>
                                    <td>{livro.autor.nome}</td>
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

export default class LivroBox extends Component {

    constructor() {
        super();
        this.state = {lista : [], autores: []};
    }

    componentDidMount() { 

        $.ajax({
            url:"http://localhost:8080/api/livros",
            dataType: 'json',
            success:resposta =>{
              this.setState({lista:resposta});
            }
          }
        );

        $.ajax({
            url:"http://localhost:8080/api/autores",
            dataType: 'json',
            success:resposta => this.setState({autores:resposta})
          }
        );
      
        PubSub.subscribe('atualiza-lista-livros', (topico,novaLista) => {
          this.setState({lista:novaLista});
        });
    }

    render() {
      return (
        <div>
          <div className="header">
            <h1>Cadastro de livros</h1>
          </div>
          <br/>
          <div className="content" id="content">
            <FormularioLivro autores={this.state.autores}/>
            <TabelaLivros lista={this.state.lista}/>
          </div>
        </div>
      );
    }   
}