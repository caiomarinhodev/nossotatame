/**
 * Created by Caio on 15/08/2015.
 */

// Definicao de variaveis de ambiente global.
var anterior = 1;
var actual = 2;
var total_pages = 0;
var actual_category = 0;
var url = "";
var count_tecnicas = 0;
var count_finalizacoes = 0;
var count_quedas = 0;
var count_passagem = 0;
var count_raspagens = 0;

//definicao de variaveis para o cronometro
var startValue = 120000; //Number of milliseconds
var time = new Date(startValue);
var interv;
var lutador1 = "";
var lutador2 = "";
var pontos_lutador1 = 0;
var pontos_lutador2 = 0;
var adv_lutador1 = 0;
var adv_lutador2 = 0;
var pen_lutador1 = 0;
var pen_lutador2 = 0;


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
        "<a href='#' class='itemizer' onclick='app.showBannerAds()'>" +

        "<img src='"+thumb+"' class='' style='margin: 2px 2px 0px 0px' width='100' height='100'>" +
        "<input type='hidden' class='conteudo' " +
        "value='"+content+"'>" +
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
        var init = content.indexOf('<iframe src=');
        var finish = content.indexOf('</iframe>');
        var iframe = content.substring(init,finish+9);
        print('iframe', iframe);
        var iframe_init = iframe.indexOf('src=');
        var iframe_finish = iframe.indexOf(' height=');
        var link = iframe.substring(iframe_init+5, iframe_finish-1);
        link = 'http:'+link;
        url = link;
        print('LINK', link);
        return true;
    }else{
        var wi = ($(document).width()) - 30;
        var new_content = content.replace(/\bwidth="(\d+)"/g, "width= "+wi+"px");
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
        $.mobile.navigate('assistir.html');
        $( "#left-panel" ).panel( "close" );
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
        $.mobile.navigate('assistir.html');
        $( "#left-panel" ).panel( "close" );
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
        $.mobile.navigate('assistir.html');
        $( "#left-panel" ).panel( "close" );
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
        $.mobile.navigate('assistir.html');
        $( "#left-panel" ).panel( "close" );
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
        $.mobile.navigate('assistir.html');
        $( "#left-panel" ).panel( "close" );
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
        $.mobile.navigate('assistir.html');
        $( "#left-panel" ).panel( "close" );
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
    if(link != "#?autoplay=1" && link != "#" && link != ""){
        $('#video').attr('src', link);
    }
});

function get_value_count_label(cat){
    var resp = $.ajax({
        type: 'GET',
        dataType: 'jsonp',
        url: get_url_categoria(cat,1),
        success: function(response){
            var total = parseInt(response.count)*parseInt(response.pages)
            $('#count_'+cat).text(total);
        },
        error: function(){
            $( "#popup_error" ).popup( "open" );
        }
    });
}


//esta funcap pega o numero de tecnicas existentes e exibe no menu panel.
function get_value_count_for_tecnicas(){
    var resp = $.ajax({
        type: 'GET',
        dataType: 'jsonp',
        url: 'http://nossotatame.net/tecnicas/page/1/?json=1',
        success: function(response){
            var total = parseInt(response.count)*parseInt(response.pages)
            $('#count_tecnicas').text(total);
        },
        error: function(){
            $( "#popup_error" ).popup( "open" );
        }
    });
}

//esta funcao inicializa o numero para cada item existente no menu panel.
function inicializa_counts_var(){
    get_value_count_label('finalizacoes');
    get_value_count_for_tecnicas();
    get_value_count_label('quedas');
    get_value_count_label('passagem-de-guarda');
    get_value_count_label('raspagens');
}

//este metodo delega para a pagina de texto, que ao inicializar, inserir conteudo na pagina(html).
$(document).delegate("#assistir", "pageinit", function() {
    //inicializa_counts_var();
    app.showInterstitial();
});

//este metodo delega para a pagina de texto, que ao inicializar, inserir conteudo na pagina(html).
$(document).delegate("#texto_page", "pageinit", function() {
    $('#div_texto').append(url);
});



//esta funcao verifica de os nomes passados nao sao vazios.
function verifica_nomes(nome1, nome2){
    if(nome1!="" && nome2!=""){
        if(nome1!=" " && nome2!=" "){
            return true;
        }
    }
    return false;
}

//esta funcao faz o apito final.
function apitar_fim(){
    //alert("Acabou a Luta!");
    try{
        $('#audio').trigger('play');
    }catch (err){

    }

    try{
        playAudio();
    }catch (err){

    }

    try{
        playAudioTwo();
    }catch (err){

    }

    try{
        playAudioTr();
    }catch (err){

    }

    try{
        playAudioFour();
    }catch (err){

    }

    $('#popup_fim').popup('open');
}

function playAudio() {
    var audioElement = document.getElementById('audio');
    var url = audioElement.getAttribute('src');
    var my_media = new Media(url,
        // success callback
        function () { console.log("playAudio():Audio Success"); },
        // error callback
        function (err) { console.log("playAudio():Audio Error: " + err); }
    );
    // Play audio
    my_media.play();
}

function playAudioTwo(){
    var audioElement = document.getElementById('audio');
    audioElement.play();
}

function playAudioTr(){
    var url = "https://dl-web.dropbox.com/get/apitodefutebol.mp3?_subject_uid=116519069&w=AAA94DoHaSqRFNYfBdy2WwKQ__J3W-7rj-v79YOu5mXK0Q";
    var my_media = new Media(url,
        // success callback
        function () { console.log("playAudio():Audio Success"); },
        // error callback
        function (err) { console.log("playAudio():Audio Error: " + err); }
    );
    // Play audio
    my_media.play();
}

function playAudioFour(){
    var url = "file:///android_asset/www/sound/apitodefutebol.mp3";
    var my_media = new Media(url,
        // success callback
        function () { console.log("playAudio():Audio Success"); },
        // error callback
        function (err) { console.log("playAudio():Audio Error: " + err); }
    );
    // Play audio
    my_media.play();
}

function mediaSuccess() {
    console.log( 'mediaSuccess' );
}
function mediaError( errObj ) {
    console.error( 'mediaError code=' + errObj.code +
        ' message=' + errObj.message );
}
function mediaStatus() {
    console.log( 'mediaStatus' );
}
function createMedia( file ) {
    if ( typeof Media != 'undefined' ) {
        if ( (typeof device != 'undefined') &&
            (device.platform == 'Android') ) {
            file = '/android_asset/www/' + file ;
        }
        return new Media( file, mediaSuccess,
            mediaError, mediaStatus );
    }
    else {
        return file ;
    }
}
function playSound( media ) {
    if ( appPaused ) {
        return ;
    }
    if ( typeof Media != 'undefined' ) {
        media.seekTo(0);
        media.play();
    }
    else {
        console.log( 'playSound ' + media );
    }
}

//// preload sound files
//snap_mp3 = createMedia( 'snap.mp3' );
//// play sound file
//playSound( snap_mp3 );

//esta funcao display o tempo.
function displayTime(){
    $(".time").text(fillZeroes(time.getMinutes()) + ":" + fillZeroes(time.getSeconds()));
}

//esta funcao insere ou remove os zeros.
function fillZeroes(t){
    t = t+"";
    if(t.length==1)
        return "0" + t;
    else
        return t;
}

//esta funcao display o nome de algum lutador.
function displayNamePlayer(i, name){
    $('#player_name_'+i).text(name);
}

//esta funcao seta a variavel dos nomes do lutadores.
function setNamePlayers(name1,name2){
    lutador1 = name1;
    lutador2 = name2;
}

//esta funcao reinicia as variaveis do cronometro.
function reinicia_variaveis_cronometro(){
    pontos_lutador1 = 0;
    pontos_lutador2 = 0;
    adv_lutador1 = 0;
    adv_lutador2 = 0;
    pen_lutador1 = 0;
    pen_lutador2 = 0;
}

//este metodo delega para quando iniciar a pagina de escolha do tempo de luta, eu reinicie as variaveis do cronometro,
//set o nome dos lutadores e defina o tempo de luta. nos clicks de cada tempo determinado.
$(document).delegate("#page_choose", "pageinit", function(){
    $('#submit_5').on('click', function(){
        reinicia_variaveis_cronometro();
        var lut1 = $('#player_1_5').val();
        var lut2 = $('#player_2_5').val();
        setNamePlayers(lut1,lut2);
        startValue = 300000;
        time = new Date(startValue);
        if(verifica_nomes(lut1,lut2)){
            $.mobile.navigate('chrono.html');
        }else{
            alert("Nomes Invalidos!")
        }
    });
    $('#submit_6').on('click', function(){
        reinicia_variaveis_cronometro();
        var lut1 = $('#player_1_6').val();
        var lut2 = $('#player_2_6').val();
        setNamePlayers(lut1,lut2);
        startValue = 360000;
        time = new Date(startValue);
        if(verifica_nomes(lut1,lut2)){
            $.mobile.navigate('chrono.html');
        }else{
            alert("Nomes Invalidos!")
        }
    });
    $('#submit_8').on('click', function(){
        reinicia_variaveis_cronometro();
        var lut1 = $('#player_1_8').val();
        var lut2 = $('#player_2_8').val();
        setNamePlayers(lut1,lut2);
        startValue = 480000;
        time = new Date(startValue);
        if(verifica_nomes(lut1,lut2)){
            $.mobile.navigate('chrono.html');
        }else{
            alert("Nomes Invalidos!")
        }
    });
    $('#submit_10').on('click', function(){
        reinicia_variaveis_cronometro();
        var lut1 = $('#player_1_10').val();
        var lut2 = $('#player_2_10').val();
        setNamePlayers(lut1,lut2);
        startValue = 600000;
        time = new Date(startValue);
        if(verifica_nomes(lut1,lut2)){
            $.mobile.navigate('chrono.html');
        }else{
            alert("Nomes Invalidos!")
        }
    });
});

//este metodo delega para quando iniciar a pagina de cronometro, limpe o tempo pause-o.
//e determina os eventos de tap para cada item na tela (up's,down's,adv e pen)(play e pause).
$(document).delegate("#page_chronometer", "pageinit", function(){
    //falta setar ids na pagina de chronometro e resetar variaveis.
    clearInterval(interv);
    displayTime();
    displayNamePlayer(1, lutador1);
    displayNamePlayer(2, lutador2);
    $(".play").on("tap", function(){
        interv = setInterval(function(){
            time = new Date(time - 1000);
            if(time<=0){
                apitar_fim();
                clearInterval(interv);
            }
            displayTime();
        }, 1000);
    });
    $(".pause").on("tap", function(){
        clearInterval(interv);
    });

    $('#startScreen_up_1').on('tap', function(){
        if(pontos_lutador1 >= 0){
            pontos_lutador1 = pontos_lutador1 + 1;
            set_pontos_lutador_display(1, pontos_lutador1);
        }
    });


    $('#startScreen_down_1').on('tap', function(){
        if(pontos_lutador1 > 0){
            pontos_lutador1 = pontos_lutador1 - 1;
            set_pontos_lutador_display(1, pontos_lutador1);
        }
    });


    $('#startScreen_up_2').on('tap', function(){
        if(pontos_lutador2 >= 0){
            pontos_lutador2 = pontos_lutador2 + 1;
            set_pontos_lutador_display(2, pontos_lutador2);
        }
    });


    $('#startScreen_down_2').on('tap', function(){
        if(pontos_lutador2 > 0){
            pontos_lutador2 = pontos_lutador2 - 1;
            set_pontos_lutador_display(2, pontos_lutador2);
        }
    });


    $('#startScreen_adv_1').on('tap', function(){
        adv_lutador1 = adv_lutador1+1;
        verifica_advertencia(1);
        set_adv_lutador_display(1, adv_lutador1);
    });

    $('#startScreen_adv_2').on('tap', function(){
        adv_lutador2 = adv_lutador2+1;
        verifica_advertencia(2);
        set_adv_lutador_display(2, adv_lutador2);
    });


    $('#startScreen_pen_1').on('tap', function(){
        pen_lutador1 = pen_lutador1+1;
        set_pen_lutador_display(1, pen_lutador1);
    });

    $('#startScreen_pen_2').on('tap', function(){
        pen_lutador2 = pen_lutador2+1;
        set_pen_lutador_display(2, pen_lutador2);
    });
});

//esta funcao seta o pontos do lutador no display.
function set_pontos_lutador_display(i, value){
    $('#player_pts_'+i).text(value);
}

//esta funcao set as advertencias do lutador no display.
function set_adv_lutador_display(i, value){
    $('#startScreen_adv_'+i).text(value);
}

//esta funcao set as penalidades do lutador no display.
function set_pen_lutador_display(i,value){
    $('#startScreen_pen_'+i).text(value);
}

//esta funcao verifica as advertencias de cada lutador e
function verifica_advertencia(i){
    if(i==1){
        if(adv_lutador1 != 0){
            if(adv_lutador1 % 3 == 0){
                pontos_lutador2 = pontos_lutador2 + 2;
                set_pontos_lutador_display(2, pontos_lutador2);
            }
        }
    }else{
        if(adv_lutador2 != 0){
            if(adv_lutador2 % 3 == 0){
                pontos_lutador1 = pontos_lutador1 + 2;
                set_pontos_lutador_display(1, pontos_lutador1);
            }
        }
    }
}



<!-- ADMOB -->
//function onDeviceReady() {
//    document.removeEventListener('deviceready', onDeviceReady, false);
//
//    // Set AdMobAds options:
//    admob.setOptions({
//        publisherId:          "ca-app-pub-1014212550826254/6276120320",  // Required
//        interstitialAdId:     "ca-app-pub-XXXXXXXXXXXXXXXX/IIIIIIIIII",  // Optional
//        isTesting: true,
//        tappxShare:           0.5                                        // Optional
//    });
//
//    // Start showing banners (atomatic when autoShowBanner is set to true)
//    admob.createBannerView();
//
//    // Request interstitial (will present automatically when autoShowInterstitial is set to true)
//    //admob.requestInterstitial();
//}
//
//document.addEventListener("deviceready", onDeviceReady, false);


/*
 index.js
 Copyright 2014 AppFeel. All rights reserved.
 http://www.appfeel.com

 AdMobAds Cordova Plugin (com.admob.google)

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to
 deal in the Software without restriction, including without limitation the
 rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 sell copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */

var app = {
    // global vars
    autoShowInterstitial: false,
    //progressDialog: document.getElementById("progressDialog"),
    //spinner: document.getElementById("spinner"),
    weinre: {
        enabled: false,
        ip: '', // ex. http://192.168.1.13
        port: '', // ex. 9090
        targetApp: '' // ex. see weinre docs
    },

    // Application Constructor
    initialize: function () {
        if (( /(ipad|iphone|ipod|android|windows phone)/i.test(navigator.userAgent) )) {
            document.addEventListener('deviceready', this.onDeviceReady, false);
        } else {
            app.onDeviceReady();
        }
    },
    // Must be called when deviceready is fired so AdMobAds plugin will be ready
    initAds: function () {
        var isAndroid = (/(android)/i.test(navigator.userAgent));
        var adPublisherIds = {
            ios : {
                banner: 'ca-app-pub-9863325511078756/5232547029',
                interstitial: 'ca-app-pub-2251004839104402/9049637370'
            },
            android : {
                banner: 'ca-app-pub-9863325511078756/9802347428',
                interstitial: 'ca-app-pub-2251004839104402/9049637370'
            },
            wp8 : {
                banner: 'ca-app-pub-9863325511078756/9802347428',
                interstitial: 'ca-app-pub-2251004839104402/9049637370'
            }
        };

        var admobid;
        if(isAndroid ) {
            admobid = adPublisherIds.android;
        } else if(/(iphone|ipad)/i.test(navigator.userAgent)) {
            admobid = adPublisherIds.ios;
        } else {
            admobid = adPublisherIds.wp8;
        }

        admob.setOptions({
            publisherId: admobid.banner,
            interstitialAdId: admobid.interstitial,
            overlap: false, // set to true, to allow banner overlap webview
            offsetStatusBar: true, // set to true to avoid ios7 status bar overlap
            isTesting: true, // receiving test ads (do not test with real ads as your account will be banned)
            autoShowBanner: true, // auto show banners ad when loaded
            autoShowInterstitial: false // auto show interstitials ad when loaded
        });

        // Adjust viewport
        var viewportScale = 1 / window.devicePixelRatio;
        //document.getElementById("viewport").setAttribute("content", "user-scalable=no, initial-scale=" + viewportScale + ", minimum-scale=0.2, maximum-scale=2, width=device-width");
    },
    // Bind Event Listeners
    bindAdEvents: function () {
        document.addEventListener("orientationchange", this.onOrientationChange, false);
        document.addEventListener(admob.events.onAdLoaded, this.onAdLoaded, false);
        document.addEventListener(admob.events.onAdFailedToLoad, this.onAdFailedToLoad, false);
        document.addEventListener(admob.events.onAdOpened, function (e) {}, false);
        document.addEventListener(admob.events.onAdClosed, function (e) {}, false);
        document.addEventListener(admob.events.onAdLeftApplication, function (e) {}, false);
        document.addEventListener(admob.events.onInAppPurchaseRequested, function (e) {}, false);
    },

    // -----------------------------------
    // Events.
    // The scope of 'this' is the event.
    // -----------------------------------
    onOrientationChange: function () {
        app.onResize();
    },
    onDeviceReady: function () {
        var weinre,
            weinreUrl;

        document.removeEventListener('deviceready', app.onDeviceReady, false);

        if (app.weinre.enabled) {
            console.log('Loading weinre...');
            weinre = document.createElement('script');
            weinreUrl = app.weinre.ip + ":" + app.weinre.port;
            weinreUrl += '/target/target-script-min.js';
            weinreUrl += '#' + app.weinre.targetApp;
            weinre.setAttribute('src', weinreUrl);
            document.head.appendChild(weinre);
        }

        if (admob) {
            console.log('Binding ad events...');
            app.bindAdEvents();
            console.log('Initializing ads...');
            app.initAds();
        } else {
            alert('AdMobAds plugin not ready');
        }
    },
    onAdLoaded: function (e) {
        if (e.adType === admob.AD_TYPE.INTERSTITIAL) {
            if (app.autoShowInterstitial) {
                admob.showInterstitialAd();
            } else {
                alert("Interstitial is available. Click on 'Show Interstitial' to show it.");
            }
        }
    },
    onAdFailedToLoad: function(e) {
        app.showProgress(false);
        alert("Could not load ad: " + e.reason);
    },
    onResize: function () {
        var msg = 'Web view size: ' + window.innerWidth + ' x ' + window.innerHeight;
        document.getElementById('sizeinfo').innerHTML = msg;
    },

    // -----------------------------------
    // App buttons functionality
    // -----------------------------------
    startBannerAds: function () {
        admob.createBannerView(function (){}, function (e) {
            //alert(JSON.stringify(e));
        });
    },
    removeBannerAds: function () {
        admob.destroyBannerView();
    },
    showBannerAds: function () {
        admob.showBannerAd(true, function (){}, function (e) {
        });
    },
    hideBannerAds: function () {
        admob.showBannerAd(false);
    },
    requestInterstitial: function (autoshow) {
        app.autoShowInterstitial = autoshow;
        admob.requestInterstitialAd(function (){}, function (e) {
        });
    },
    showInterstitial: function() {
        admob.showInterstitialAd(function (){}, function (e) {
        });
    }

};