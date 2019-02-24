{
    /**
     * @author Marcos Gallardo Pérez
     */
    $(init)
    let campoMinas,
        tableroArrayDom,
        arrayDestapadas,
        tableroDom,
        reiniciaDom,
        numeroDeBanderasDom,
        numeroDeBanderas,
        arrayMina,
        banderasDom,
        corriendo = false,
        tiempo_corriendo,
        horasDom,
        minutosDom,
        segundosDom;

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
            case "Medio":
                campoMinas = buscaminas.init(2);
                break;
            case "Difícil":
                campoMinas = buscaminas.init(3);
                break;
            default:
                campoMinas = buscaminas.init();
                break;
        }
        alternaReinicia('none');
        restaurarReloj();
        detenerReloj();
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
                if (e.buttons === 3) {
                    ayudaDescubrirCasilla(i, j);
                }
                //Click Derecho
                else if (e.buttons === 2) {
                    marcaCasilla(i, j);
                }
                //Click Izquierdo
                else if (e.buttons === 1) {
                    picarCasilla(i, j);
                }
            } catch (e) {
                if (e.message === "BOMM!!")
                    perder();
                else if (e.message === "Enhorabuena, has ganado.") {
                    ganar(e);
                } else
                    console.log(e.message); // Para recoger otro tipo de errores.

                if (e.message === "Has perdido, inicia una partida." || e.message === "Enhorabuena, has ganado.") {
                    reiniciaDom.hide(1, () => {
                        reiniciaDom.show('shake');
                    });
                }
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
                tableroArrayDom[i][j] = $('<div id='+i+'_'+j+' class="casillaBuscamina"><span><span></div>');
                divContenedor.append(tableroArrayDom[i][j]);
                if (campoMinas[i][j].valor === 9) {
                    arrayMina.push(tableroArrayDom[i][j]); //Creación de una array con las coordenadas de las minas para acceder a ellas de una manera más facil.
                    numeroDeBanderas++;
                }
            }
        }
        numeroDeBanderasDom.text(numeroDeBanderas);
        tableroDom.html(divContenedor);
        aplicaEstilosTablero();
    }

    function aplicaEstilosTablero() {
        if (campoMinas.length < 10) {
            $('.Tablero>div').css("grid-template-columns", "repeat(" + campoMinas.length + ",113px)");
            $('.casillaBuscamina').css("height", '110px');
        } else if (campoMinas.length > 10 && campoMinas.length < 17) {
            $('.Tablero>div').css("grid-template-columns", "repeat(" + campoMinas.length + ",56px)");
            $('.casillaBuscamina').css("height", '56px');
        } else if (campoMinas.length > 25 && campoMinas.length < 120) {
            $('.Tablero>div').css("grid-template-columns", "repeat(" + campoMinas.length + ",30px)");
            $('.casillaBuscamina').css("height", '30px');
        }
    }

    function picarCasilla(i, j) {
        if (!tableroArrayDom[i][j].hasClass("casillaDescubierta")) {
            arrayDestapadas = buscaminas.picar(parseInt(i), parseInt(j));
            actualizaTableroPicar();
            if (!corriendo) {
                activaFuncionamientoReloj();
            }
        }
    }

    function ayudaDescubrirCasilla(i, j) {
        [arrayDestapadas, arrayCircundantes] = buscaminas.despejar(parseInt(i), parseInt(j));
        actualizaTableroPicar();
        $.each(arrayCircundantes, function (index, value) {
            if (tableroArrayDom[value.i][value.j].hasClass('casillaBuscamina')) {
                if (tableroArrayDom[value.i][value.j].hasClass('colorAnimation')) {
                    tableroArrayDom[value.i][value.j].removeClass('colorAnimation');
                    tableroArrayDom[value.i][value.j].offset();
                }
                tableroArrayDom[value.i][value.j].addClass('colorAnimation');
            }
        });
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

    function ganar(e) {
        tableroDom.append("<p class='mensajeVictoria'>Enhorabuena, has ganado.</p>");
        arrayDestapadas = e.arrayLevantadas;
        actualizaTableroPicar();
        for (value of arrayMina) {
            value.css({
                background: "url(img/ganar.png)",
                "background-size": "cover"
            })
        }
        $(".casillaDescubierta").css({
            "background-color": "rgba(106,185,53,0.64)"
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
            tableroArrayDom[i][j].fadeOut(1, () => {
                tableroArrayDom[i][j].fadeIn(500);
            });

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
                "background-size": "cover"
            });
        }
    }

    function marcaCasilla(i, j) {
        if (!tableroArrayDom[i][j].hasClass("casillaDescubierta")) {
            buscaminas.marcar(parseInt(i), parseInt(j));
            marcaCasillaDOM(i, j);
        }

    }

    function marcaCasillaDOM(i, j) {
        if (tableroArrayDom[i][j].hasClass("casillaBuscamina")) {
            if (numeroDeBanderas === 0) { //Si ya has puesto todas las banderas, no te deja marcar más
                banderasDom.css({
                    "color": "red"
                });
                banderasDom.hide(1, () => {
                    banderasDom.show('bounce');
                });
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