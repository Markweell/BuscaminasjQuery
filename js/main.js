{
    /**
     * @author Marcos Gallardo Pérez
     */
    $(init)
    /**
     * Matriz que viene de la capa de negocio donde se guardan los valores
     */
    let campoMinas;
    /**
     * Matriz de elementos Div, que es lo que le mostramos al usuario
     */
    let tableroArrayDom;
    /**
     * Array que se va a llenar de coordenadas que se van a destapar en cada acción
     */
    let arrayDestapadas;
    /**
     * Tablero contenedor del tableroArrayDom. 
     */
    let $tableroDom;
    /**
     * Elemento div que vamos a usar para reiniciar un partida que ha terminado.
     */
    let $reiniciaDom;
    /**
     * Elemento del dom que da información sobre las banderas que quedan por usar
     */
    let $numeroDeBanderasDom;
    /**
     * Número de banderas que quedan por poner
     */
    let numeroDeBanderas;
    /**
     * Array con la posición de las minas que hay puestas en el tablero
     */
    let arrayMina;
    /**
     * Elemento del dom que recoje el icono y el numeroDeBanderasDom.
     */
    let $banderasDom;
    /**
     * Controlador del reloj de la partida
     */
    let corriendo = false;
    /**
     * Tiempo que lleva el juego
     */
    let tiempo_corriendo;
    /**
     * Numero de horas que lleva la partida
     */
    let $horasDom;
    /**
     * Número de minutos que lleva la partida
     */
    let $minutosDom;
    /**
     * Segundos que lleva la partida
     */
    let $segundosDom;

    /**
     * Función encargada de iniciar el contenido del juego. En  ella se recojen en variables los elementos del dom
     * para evitar que se hagan muchas llamadas al dom durante la ejecución. 
     */
    function init() {
        $tableroDom = $(".Tablero");
        $reiniciaDom = $(".Reinicia");
        $numeroDeBanderasDom = $("#numBanderas");
        $banderasDom = $(".Banderas");

        $horasDom = $("#horas");
        $minutosDom = $("#minutos");
        $segundosDom = $("#segundos");
        $("#dificultad").change(iniciarPartida).change(); //Se autolanza al principio para que inicie el juego

        asignacionEventosDom();
    }
    /**
     * Función encargada de iniciar el juego. Pone todas la variables del juego a su estado inicial
     */
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
        $banderasDom.css({
            "color": "black"
        });
    }
    /**
     * Función encargada de asignar los eventos a las distintas partes del Dom 
     */
    function asignacionEventosDom() {
        //Quitar el menu contextual
        $tableroDom.contextmenu(function (e) {
            e.preventDefault();
        });
        //Añadimos los eventos del teclado
        $tableroDom.mousedown(function (e) {
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
                    perder(e);
                else if (e.message === "Enhorabuena, has ganado.") {
                    ganar(e);
                } else
                    console.log(e.message); // Para recoger otro tipo de errores.

                if (e.message === "Has perdido, inicia una partida." || e.message === "Enhorabuena, has ganado.") {
                    $reiniciaDom.hide(1, () => {
                        $reiniciaDom.show('shake');
                    });
                }
            }
        });
        $reiniciaDom.click(function () {
            iniciarPartida();
            alternaReinicia('none');
        });
    }
    /**
     * Crea el tablero visual que es lo que le llega al usuario
     */
    function creacionTablero() {
        arrayMina = [];
        numeroDeBanderas = 0;
        tableroArrayDom = [campoMinas.length];
        let $divContenedor = $('<div></div>'); //Div intermedio, lo usamos para no hacer más de una carga al Dom. 
        for (let i = 0; i < campoMinas.length; i++) {
            tableroArrayDom[i] = [campoMinas.length];
            for (let j = 0; j < campoMinas[1].length; j++) {
                tableroArrayDom[i][j] = $('<div id=' + i + '_' + j + ' class="casillaBuscamina"><span><span></div>');
                $divContenedor.append(tableroArrayDom[i][j]);
                if (campoMinas[i][j].valor === 9) {
                    arrayMina.push(tableroArrayDom[i][j]); //Creación de una array con las coordenadas de las minas para acceder a ellas de una manera más facil.
                    numeroDeBanderas++;
                }
            }
        }
        $numeroDeBanderasDom.text(numeroDeBanderas);
        $tableroDom.html($divContenedor);
        aplicaEstilosTablero();
    }
    /**
     * Añade css al tablero para cuadrarlo según las fichas que tenga
     */
    function aplicaEstilosTablero() {
        if (campoMinas.length < 10) {
            $('.Tablero>div').css({
                "grid-template-columns": "repeat(" + campoMinas.length + ",40px)",
                "justify-content": "center"});
            $('.casillaBuscamina').css({"height": '40px'});
        } else if (campoMinas.length > 10 && campoMinas.length < 17) {
            $('.Tablero>div').css({
                "grid-template-columns": "repeat(" + campoMinas.length + ",40px)",
                "justify-content": "center"});
            $('.casillaBuscamina').css({"height": '40px'});
        } else if (campoMinas.length > 25 && campoMinas.length < 120) {
            $('.Tablero>div').css("grid-template-columns", "repeat(" + campoMinas.length + ",30px)");
            $('.casillaBuscamina').css("height", '30px');
        }
    }

    /**
     * Recoje todas las acciones que se llevan a cabo cuando se pica una casilla.
     * @param {Coordenada x} i 
     * @param {Coordenada y} j 
     */
    function picarCasilla(i, j) {
        if (!tableroArrayDom[i][j].hasClass("casillaDescubierta")) {
            arrayDestapadas = buscaminas.picar(parseInt(i), parseInt(j));
            actualizaTableroPicar();
            if (!corriendo) {
                activaFuncionamientoReloj();
            }
        }
    }

    /**
     * Recoje todas las acciones que se llevan a cabo cuando se despeja una casilla.
     * @param {Coordenada x} i 
     * @param {Coordenada y} j 
     */
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

    /**
     * Coge el arrayDestapadas y muestra su contenido aplicandole una animación.
     */
    function actualizaTableroPicar() {
        $.each(arrayDestapadas, function (index, value) {
            // setTimeout(function () {
            descubreCasilla(value.i, value.j, index * 10 + 100)
            // }, index * 10 + 100);
        });

    }
    /**
     * Recoje todas las acciones que se llevan a cabo cuando se pierde la partida.
     */
    function perder(error) {

        $("#" + error.i + "_" + error.j).hide(100).css({ //Muestra la primera bomba
            background: "url(img/mina.png)",
            "background-size": "cover",
            border: "1px solid red"
        }).show('pulsate', 1000);

        $(".casillaMarcada").css({
            background: "url(img/banderaIncorrecta.png)",
            "background-size": "cover"
        });
        $.each(arrayMina, function (index, value) { //Muestra las demas bombas
            if (!value.hasClass("casillaMarcada")) {
                setTimeout(() => {
                    value.hide(100);
                    value.css({
                        background: "url(img/mina.png)",
                        "background-size": "cover",
                        border: "1px solid red"
                    })
                    value.show('pulsate', 1000);
                }, index * 10 + 100)
            } else {
                value.css({
                    background: "url(img/banderaCorrecta.png)",
                    "background-size": "cover",
                    border: "1px solid red"
                })
            }
        })
        $(".casillaDescubierta").css({ //Pone el fondo de rojo.
            "background-color": "rgba(185,53,53,0.64)"
        });

        detenerReloj();
        alternaReinicia("inline");
    }
    /**
     * Recoje todas las acciones que se llevan a cabo cuando se pierde la partida.
     */
    function ganar(e) {
        $tableroDom.append("<p class='mensajeVictoria'>Enhorabuena, has ganado.</p>");
        arrayDestapadas = e.arrayLevantadas;
        actualizaTableroPicar();

        $($.map(arrayMina, (elem) => {
            return elem.get();
        })).css({ // Le aplica a todos los elementos de arrayMina el css correspondiente.
            background: "url(img/ganar.png)",
            "background-size": "cover"
        })

        $(".casillaDescubierta").css({
            "background-color": "rgba(106,185,53,0.64)"
        });
        detenerReloj();
        alternaReinicia("inline");
    }

    /**
     * Muestra o oculta el div que te permite reiniciar la partida
     */
    function alternaReinicia(tipoDisplay) {
        $reiniciaDom.css({
            display: tipoDisplay
        });

    }

    /**
     * Al pasarle una coordenada, muestra su contenido. 
     * @param {Coordenada x} i 
     * @param {Coordenada Y} j 
     */
    function descubreCasilla(i, j, delay) {
        if (!tableroArrayDom[i][j].hasClass("casillaDescubierta")) { //Si no está descubierta ya
            tableroArrayDom[i][j].removeClass("casillaBuscamina");
            tableroArrayDom[i][j].addClass("casillaDescubierta");
            tableroArrayDom[i][j].delay(delay).fadeOut(1, () => {
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

    /**
     * Controla si se puede marcar una casilla y en caso de que se pueda, llama al método que la marca
     */
    function marcaCasilla(i, j) {
        if (!tableroArrayDom[i][j].hasClass("casillaDescubierta")) {
            buscaminas.marcar(parseInt(i), parseInt(j));
            marcaCasillaDOM(i, j);
        }

    }
    /**
     * Recoje todas las acciones que se llevan a cabo cuando se marca una casilla.
     */
    function marcaCasillaDOM(i, j) {
        if (tableroArrayDom[i][j].hasClass("casillaBuscamina")) {
            if (numeroDeBanderas === 0) { //Si ya has puesto todas las banderas, no te deja marcar más
                $banderasDom.css({
                    "color": "red"
                });
                $banderasDom.hide(1, () => {
                    $banderasDom.show('bounce');
                });
                return;
            }
            tableroArrayDom[i][j].removeClass("casillaBuscamina", 500, () => {
                tableroArrayDom[i][j].addClass("casillaMarcada");
            });
            $numeroDeBanderasDom.text(--numeroDeBanderas);

        } else { //Esto ocurre al picar sobre una bandera ya puesta
            $banderasDom.css({
                "color": "black"
            });
            tableroArrayDom[i][j].addClass("casillaBuscamina");
            tableroArrayDom[i][j].removeClass("casillaMarcada");
            $numeroDeBanderasDom.text(++numeroDeBanderas);
        }
    }
    /**
     * Activa el funcionamiento del reloj
     */
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

            $horasDom.text(tiempo.hora < 10 ? '0' + tiempo.hora : tiempo.hora);
            $minutosDom.text(tiempo.minuto < 10 ? '0' + tiempo.minuto : tiempo.minuto);
            $segundosDom.text(tiempo.segundo < 10 ? '0' + tiempo.segundo : tiempo.segundo);
        }, 1000);
        corriendo = true;

    }
    /**
     * Detiene el reloj
     */
    function detenerReloj() {
        clearInterval(tiempo_corriendo);
        corriendo = false;
    }

    /**
     * Restaura el funcionamiento del reloj
     */
    function restaurarReloj() {
        $horasDom.text('00');
        $minutosDom.text('00');
        $segundosDom.text('00');
    }


}