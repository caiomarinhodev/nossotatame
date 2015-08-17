/**
 * Created by Caio on 15/08/2015.
 */

// Definicao de variaveis de ambiente global.
var anterior = 0;
var actual = 1;
var total_pages = 0;
var actual_category = 0;
var url = "";

//metodo para pegar url da home (geral).
function get_url_geral(indice){
    var url ='http://nossotatame.net/page/'+indice+'/?json=1';
    return url;
}

//metodo para print no console in dev moment.
function print(key, value){
    console.log(key+" - "+ value);
}

//metodo para pegar conteudo por pagina para a list de Início (geral), com atualização das variaveis globais.
function get_content_home_server(page){
    var resp = $.ajax({
            type: 'GET',
            dataType: 'jsonp',
            url: get_url_geral(page),
            success: function(response){
                total_pages = parseInt(response.pages);
                actual_category = 0;
                anterior = page - 1;
                actual = page;
                enable_anterior(actual);
                var lista = $('#lista');
                var posts = response.posts;
                print('total_pages', total_pages);
                print('actual_category', actual_category);
                print('anterior', anterior);
                print('actual', actual);
                print('posts',posts);
                posts.forEach(function(post) {
                    add_item_in_list(post.id, post.title,
                        post.thumbnail, post.date,post.content,
                        post.categories[0].title, post.excerpt)
                });
                refresh_list();
            },
            error: function(){
                $( "#popup_error" ).popup( "open" );
            }
        });
}

//este metodo pega conteudo por pagina da categoria Tecnicas, atualizando as variaveis globais.
function get_content_cat_tec_server(page){
    var resp = $.ajax({
        type: 'GET',
        dataType: 'jsonp',
        url: 'http://nossotatame.net/tecnicas/page/'+page+'/?json=1',
        success: function(response){
            total_pages = parseInt(response.pages);
            actual_category = 1;
            anterior = page - 1;
            actual = page;
            enable_anterior(actual);
            var lista = $('#lista');
            var posts = response.posts;
            print('total_pages', total_pages);
            print('actual_category', actual_category);
            print('anterior', anterior);
            print('actual', actual);
            print('posts',posts);
            posts.forEach(function(post) {
                add_item_in_list(post.id, post.title,
                    post.thumbnail, post.date,post.content,
                    post.categories[0].title, post.excerpt)
            });
            refresh_list();
        },
        error: function(){
            $( "#popup_error" ).popup( "open" );
        }
    });
}

//metodo para pegar conteudo por pagina para a list por Categoria, com atualização das variaveis, menos actual_category,
// pois é esta eh atualizada antes, quando se escolhe a categoria (delegaçoes).
function get_content_cat_server(cat, page){
    var resp = $.ajax({
        type: 'GET',
        dataType: 'jsonp',
        url: get_url_categoria(cat,page),
        success: function(response){
            total_pages = parseInt(response.pages);
            anterior = page - 1;
            actual = page;
            enable_anterior(actual);
            var lista = $('#lista');
            var posts = response.posts;
            print('total_pages', total_pages);
            print('actual_category', actual_category);
            print('anterior', anterior);
            print('actual', actual);
            print('posts',posts);
            posts.forEach(function(post) {
                add_item_in_list(post.id, post.title,
                    post.thumbnail, post.date,post.content,
                    post.categories[0].title, post.excerpt)
            });
            refresh_list();
        },
        error: function(){
            $( "#popup_error" ).popup( "open" );
        }
    });
    return resp;
}

//este metodo gera uma url por categoria e por pagina (indice).
function get_url_categoria(categoria, indice){
    var url = 'http://nossotatame.net/tecnicas/'+categoria+'/page/'+indice+'/?json=1';
    return url;
}

//este metodo delega a pagina Assistir, ao iniciar pegue o conteudo de categoria geral.
$(document).delegate("#assistir", "pageinit", function(){
    get_content_home_server(actual);

});

//esta funcao adiciona um item a lista.
function add_item_in_list(id, title,
                          thumb, date,content,
                          category, excerpt){
    var lista = $('#lista');
    var item = "<li id='"+id+"'>" +
        "<a href='#' class='itemizer'>" +
        "<input type='hidden' class='conteudo' " +
        "value='"+content+"'>" +
        "<img src='"+thumb+"'>" +
        "<h2>"+title+"</h2>" +
        "<p>"+excerpt+"</p>" +
        "<h6> Categoria: "+category+"</h6>" +
        "</a>" +
        "</li>";
    lista.append(item);
}

// esta funcao refresh lista e delega metodo de click para cada item.
function refresh_list(){
    var lista = $('#lista');
    lista.promise().done(function () {
        //refresh list here
        $(this).listview("refresh");
        //then add click event using delegation
        $(this).on("click", "li", function () {
            var content = $(this).children().children().children('.itemizer').children('.conteudo').val();
            if(get_source_video(content)){
                $.mobile.navigate('video.html');
            }else{
                $.mobile.navigate('texto.html');
            }
            //var div = $('#div_video');
            //div.append(url);
            //div.page();
        });
    });
}

//metodo verifica se existe <iframe> no conteudo do post
function exist_video(content){
    if(content.indexOf('</iframe>') != -1){
        return true;
    }
    return false;
}

//metodo pega apenas o url ou  conteudo para incluir no source da pagina de video ou pagina de texto.
function get_source_video(content){
    if(exist_video(content)){
        print('content', content);
        var init = content.indexOf('<iframe src=');
        var finish = content.indexOf('</iframe>');
        var iframe = content.substring(init,finish+9);
        print('iframe', iframe);
        var iframe_init = iframe.indexOf('src=');
        var iframe_finish = iframe.indexOf(' height=');
        var link = iframe.substring(iframe_init+5, iframe_finish-1);
        print('link',link);
        url = link;
        return true;
    }else{
        print('content', content);
        var wi = ($(document).width()) - 30;
        var new_content = content.replace(/\bwidth="(\d+)"/g, "width= "+wi+"px");
        print('content', new_content);
        url = new_content;
        return false;
    }

}

//esta funcao habilita ou nao o botao Anterior para paginacao.
function enable_anterior(actual){
    if(actual>1){
        $('#see_less_home').removeClass('ui-disabled');
    }else{
        $('#see_less_home').addClass('ui-disabled');
    }
}

//este metodo delega para o botao Ver Mais, uma atualização de variaveis, bem como filtrando de acordo com
// a actual_category.
$(document).delegate("#see_more_home", "click", function(){
    $('#lista').empty();
    var new_page = actual + 1;
    var new_anterior = actual;
    if(new_page<=total_pages && new_anterior>=0){
        if(actual_category==0){
            get_content_home_server(new_page);
        }else if(actual_category==1){
            get_content_cat_tec_server(new_page);
        }else if(actual_category==2){
            get_content_cat_server('finalizacoes', new_page);
        }else if(actual_category==3){
            get_content_cat_server('quedas', new_page);
        }else if(actual_category==4){
            get_content_cat_server('passagem-de-guarda', new_page);
        }else if(actual_category==5){
            get_content_cat_server('raspagens', new_page);
        }else{
            $( "#popup_error" ).popup( "open" );
        }
    }else{
        $( "#popup_alert" ).popup( "open" );
    }
});

//este metodo delega para o botao Anterior, uma atualização de variaveis, bem como filtrando de acordo com
// a actual_category.
$(document).delegate("#see_less_home", "click", function(){
    $('#lista').empty();
    var new_page = anterior;
    var new_anterior = anterior - 1;
    if(new_page<=total_pages && new_anterior>=0){
        if(actual_category==0){
            get_content_home_server(new_page);
        }else if(actual_category==1){
            get_content_cat_tec_server(new_page);
        }else if(actual_category==2){
            get_content_cat_server('finalizacoes', new_page);
        }else if(actual_category==3){
            get_content_cat_server('quedas', new_page);
        }else if(actual_category==4){
            get_content_cat_server('passagem-de-guarda', new_page);
        }else if(actual_category==5){
            get_content_cat_server('raspagens', new_page);
        }else{
            $( "#popup_error" ).popup( "open" );
        }
    }else{
        $( "#popup_alert" ).popup( "open" );
    }
});

// este metodo delega para o link Inicio no panel, para inicializar uma lista da Home (geral). Atualizando também
// as variáveis.
$(document).delegate("#inicio", "click", function(){
    var new_page = 1;
    var new_anterior = 0;
    var new_category = 0;
    if(new_page<=total_pages && new_anterior>=0){
        $('#lista').listview();
        $('#lista').empty();
        actual_category = new_category;
        get_content_home_server(new_page);
    }else{
        $( "#popup_alert" ).popup( "open" );
    }
});

// este metodo delega para o link Tecnicas no panel, para inicializar uma lista de técnicas.
$(document).delegate("#tecnicas", "click", function(){
    var new_page = 1;
    var new_anterior = 0;
    var new_category = 1;
    if(new_page<=total_pages && new_anterior>=0){
        $('#lista').empty();
        actual_category = new_category;
        get_content_cat_tec_server(new_page);
    }else{
        $( "#popup_alert" ).popup( "open" );
    }
});

// este metodo delega para o link Finalizações no panel, para inicializar uma lista de finalizações.
$(document).delegate("#finalizacoes", "click", function(){
    var new_page = 1;
    var new_anterior = 0;
    var new_category = 2;
    if(new_page<=total_pages && new_anterior>=0){
        $('#lista').empty();
        actual_category = new_category;
        get_content_cat_server('finalizacoes', new_page);
    }else{
        $( "#popup_alert" ).popup( "open" );
    }
});

// este metodo delega para o link Quedas no panel, para inicializar uma lista da quedas.
$(document).delegate("#quedas", "click", function(){
    var new_page = 1;
    var new_anterior = 0;
    var new_category = 3;
    if(new_page<=total_pages && new_anterior>=0){
        $('#lista').empty();
        actual_category = new_category;
        get_content_cat_server('quedas', new_page);
    }else{
        $( "#popup_alert" ).popup( "open" );
    }
});

// este metodo delega para o link Passagem de Guarda no panel, para inicializar uma lista de passagens.
$(document).delegate("#passagem_de_guarda", "click", function(){
    var new_page = 1;
    var new_anterior = 0;
    var new_category = 4;
    if(new_page<=total_pages && new_anterior>=0){
        $('#lista').listview();
        $('#lista').empty();
        actual_category = new_category;
        get_content_cat_server('passagem-de-guarda', new_page);
    }else{
        $( "#popup_alert" ).popup( "open" );
    }
});

// este metodo delega para o link Raspagens no panel, para inicializar uma lista da raspagens.
$(document).delegate("#raspagens", "click", function(){
    var new_page = 1;
    var new_anterior = 0;
    var new_category = 5;
    if(new_page<=total_pages && new_anterior>=0){
        $('#lista').empty();
        actual_category = new_category;
        get_content_cat_server('raspagens', new_page);
    }else{
        $( "#popup_alert" ).popup( "open" );
    }
});



//este metodo delega para a pagina de video (Video_Page), que ao inicializar, setar o width attr para o tamanho
// adequado.
$( document ).delegate("#video_page", "pageinit", function() {
    var wi = ($(document).width()) - 30;
    $('#video').attr('width', '' + wi);
    var link = url+"?autoplay=1";
    print('link',link);
    if(link != "#?autoplay=1" && link != "#" && link != ""){
        $('#video').attr('src', link);
    }
});

//este metodo delega para a pagina de texto, que ao inicializar, inserir conteudo na pagina(html).
$(document).delegate("#texto_page", "pageinit", function() {
    print('url',url);
    $('#div_texto').append(url);
});