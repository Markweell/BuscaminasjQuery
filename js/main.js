{
    /**
     * @author Marcos Gallardo Pérez
     */
    $(init)
    let campoMinas;
    let tableroArrayDom;
    let arrayDestapadas;
    let tableroDom;
    let reiniciaDom;
    let numeroDeBanderasDom;
    let numeroDeBanderas;
    let arrayMina;
    let banderasDom;
    let corriendo = false;
    let tiempo_corriendo;

    let horasDom;
    let minutosDom;
    let segundosDom;

    function init() {
        tableroDom = $(".Tablero");
        reiniciaDom = $(".Reinicia");
        numeroDeBanderasDom = $("#numBanderas");
        banderasDom = $(".Banderas");

        horasDom = $("#horas");
        minutosDom = $("#minutos");
        segundosDom = $("#segundos");
        $("#dificultad").change(iniciarPartida).change();

        asignacionEventosDom();
    }

    function iniciarPartida() {
        switch ($("select option:selected").text()) {
            case "Facil":
                campoMinas = buscaminas.init();
                break;
            case "Medio":
                campoMinas = buscaminas.init(2);
                break;
            case "Dificil":
                campoMinas = buscaminas.init(3);
                break;
            default:
                buscaminas.init();
        }
        alternaReinicia('none');
        restaurarReloj();detenerReloj();
        creacionTablero();
        banderasDom.css({
            "color": "black"
        });
    }

    function asignacionEventosDom() {
        //Quitar el menu contextual
        tableroDom.contextmenu(function (e) {
            e.preventDefault();
        });
        //Añadimos los eventos del teclado
        tableroDom.mousedown(function (e) {
            [i, j] = e.target.id.split("_");
            try {
                //Click Doble
                if (e.button == 2 && e.buttons == 3) {
                    arrayDestapadas = buscaminas.despejar(parseInt(i), parseInt(j));
                    actualizaTableroPicar();
                }
                //Click Derecho
                if (e.button == 2 && e.buttons == 2) {
                    if (tableroArrayDom[i][j].hasClass("casillaDescubierta")) {
                        return;
                    }
                    buscaminas.marcar(parseInt(i), parseInt(j));
                    marcaCasilla(i, j);
                }
                //Click Izquierdo
                if (e.button == 0 && e.buttons == 1) {
                    if (!tableroArrayDom[i][j].hasClass("casillaDescubierta")) {
                        arrayDestapadas = buscaminas.picar(parseInt(i), parseInt(j));
                        actualizaTableroPicar();
                        if (!corriendo) {
                            activaFuncionamientoReloj();
                        }
                    }
                }
            } catch (e) {
                if (e.message == "BOMM!!") {
                    perder();
                }
                if (e.message == "Enhorabuena, has ganado.") {
                    ganar();
                }
                if (e.message == "Has perdido, inicia una partida." || e.message == "Enhorabuena, has ganado.") {
                    if(reiniciaDom.hasClass('scale-animation')){
                        reiniciaDom.removeClass('scale-animation');
                        reiniciaDom.offset();
                    }
                    reiniciaDom.addClass('scale-animation');
                        // .velocity({ //Pequeña animación para recordarnos que tenemos que empezar una partida si hemos perdido.
                        //     "font-size": "200px"
                        // }, 100, "linear")
                        // .velocity({
                        //     "font-size": "100px"
                        // }, 10000, "linear");

                }
                console.log(e.message);
            }
        });
        reiniciaDom.click(function () {
            iniciarPartida();
            alternaReinicia('none');
        });
    }

    function creacionTablero() {
        arrayMina = [];
        numeroDeBanderas = 0;
        tableroArrayDom = [campoMinas.length];
        let divContenedor = $('<div></div>'); //Div intermedio, lo usamos para no hacer más de una carga al Dom. 
        for (let i = 0; i < campoMinas.length; i++) {
            tableroArrayDom[i] = [campoMinas.length];
            for (let j = 0; j < campoMinas[1].length; j++) {
                tableroArrayDom[i][j] = $('<div class="casillaBuscamina"><span><span></div>');
                tableroArrayDom[i][j].attr('id', i + "_" + j);
                divContenedor.append(tableroArrayDom[i][j]);
                if (campoMinas[i][j].valor == 9) {
                    arrayMina.push(tableroArrayDom[i][j]); //Creación de una array con las coordenadas de las minas para acceder a ellas de una manera más facil.
                    numeroDeBanderas++;
                }
            }
        }
        numeroDeBanderasDom.text(numeroDeBanderas);
        tableroDom.html(divContenedor);
        $('.Tablero>div').css("grid-template-columns", "repeat(" + campoMinas.length + ",1fr)");
        $('.casillaBuscamina').css("height", tableroArrayDom[1][2].css('width'));
        //Ajustamos el tamaño de las casillas al ancho deseado y hacemos que sean cuadradas.
    }

    function actualizaTableroPicar() {

        $.each(arrayDestapadas, function (index, value) {
            setTimeout(function () {
                descubreCasilla(value.i, value.j)
            }, index * 10 + 100);
        });

    }

    function perder() {
        $(".casillaDescubierta").css({
            "background-color": "rgba(185,53,53,0.64)"
        });
        for (value of arrayMina) {
            value.css({
                background: "url(img/mina.png)",
                "background-size": "cover",
                border: "1px solid red"
            })
        }
        detenerReloj();
        alternaReinicia("inline");
    }

    function ganar() {
        tableroDom.append("<p class='mensajeVictoria'>Enhorabuena, has ganado.</p>");
        $(".casillaDescubierta").css({
            "background-color": "rgba(106,185,53,0.64)"
        });
        $.each(campoMinas, function (index) {
            $.each(campoMinas[index], function (index2, value) {
                if (value.valor != 9) {
                    descubreCasilla(index, index2);
                }
                if (value.valor == 9) {
                    tableroArrayDom[index][index2].css({
                        background: "url(img/ganar.png)",
                        "background-size": "cover"
                    })
                }
            })
        });
        detenerReloj();
        alternaReinicia("inline");
    }

    function alternaReinicia(tipoDisplay) {
        reiniciaDom.css({
            display: tipoDisplay
        });

    }

    function descubreCasilla(i, j) {
        if (!tableroArrayDom[i][j].hasClass("casillaDescubierta")) { //Si no está descubierta ya
            tableroArrayDom[i][j].removeClass("casillaBuscamina");
            tableroArrayDom[i][j].addClass("casillaDescubierta");
            if (campoMinas[i][j].valor !== 0) { //Si el valor es 0, no muestro su valor.
                switch (campoMinas[i][j].valor) {
                    case 1:
                        tableroArrayDom[i][j].css({
                            background: "url(img/uno.png)"
                        });
                        break;
                    case 2:
                        tableroArrayDom[i][j].css({
                            background: "url(img/dos.png)"
                        })
                        break;
                    case 3:
                        tableroArrayDom[i][j].css({
                            background: "url(img/tres.png)"
                        })
                        break;
                    case 4:
                        tableroArrayDom[i][j].css({
                            background: "url(img/cuatro.png)"
                        })
                        break
                    case 5:
                        tableroArrayDom[i][j].css({
                            background: "url(img/cinco.png)"
                        })
                        break;
                    case 6:
                        tableroArrayDom[i][j].css({
                            background: "url(img/seis.png)"
                        })
                        break;
                    case 7:
                        tableroArrayDom[i][j].css({
                            background: "url(img/siete.png)"
                        })
                        break;
                    case 8:
                        tableroArrayDom[i][j].css({
                            background: "url(img/ocho.png)"
                        })
                        break;
                }
            }
            tableroArrayDom[i][j].css({
                "animation": "animacion 0.3s 1 linear",
                "background-size": "cover"
            });
        }
    }

    function marcaCasilla(i, j) {
        if (tableroArrayDom[i][j].hasClass("casillaBuscamina")) {
            if (numeroDeBanderas === 0) { //Si ya has puesto todas las banderas, no te deja marcar más
                banderasDom.css({
                    "color": "red"
                });
                // if(banderasDom.hasClass('scale-animation')){
                //     banderasDom.removeClass('scale-animation');
                //     banderasDom.offset();
                // }
                // banderasDom.addClass('scale-animation');
                 banderasDom
                     .velocity({
                         "font-size": "50px"
                     }, 200, "linear")
                     .velocity({
                         "font-size": "20px"
                     }, 400, "linear");
                return;
            }
            tableroArrayDom[i][j].addClass("casillaMarcada");
            tableroArrayDom[i][j].removeClass("casillaBuscamina");
            numeroDeBanderasDom.text(--numeroDeBanderas);

        } else { //Esto ocurre al picar sobre una bandera ya puesta
            banderasDom.css({
                "color": "black"
            });
            tableroArrayDom[i][j].addClass("casillaBuscamina");
            tableroArrayDom[i][j].removeClass("casillaMarcada");
            numeroDeBanderasDom.text(++numeroDeBanderas);
        }
    }

    function activaFuncionamientoReloj() {
        let tiempo = {
            hora: 0,
            minuto: 0,
            segundo: 0
        };

        tiempo_corriendo = null;


        tiempo_corriendo = setInterval(function () {
            // Segundos
            tiempo.segundo++;
            if (tiempo.segundo >= 60) {
                tiempo.segundo = 0;
                tiempo.minuto++;
            }

            // Minutos
            if (tiempo.minuto >= 60) {
                tiempo.minuto = 0;
                tiempo.hora++;
            }

            horasDom.text(tiempo.hora < 10 ? '0' + tiempo.hora : tiempo.hora);
            minutosDom.text(tiempo.minuto < 10 ? '0' + tiempo.minuto : tiempo.minuto);
            segundosDom.text(tiempo.segundo < 10 ? '0' + tiempo.segundo : tiempo.segundo);
        }, 1000);
        corriendo = true;

    }

    function detenerReloj() {
        clearInterval(tiempo_corriendo);
        corriendo = false;
    }
    function restaurarReloj() {
        horasDom.text('00');
        minutosDom.text('00');
        segundosDom.text('00');
    }


}