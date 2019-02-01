let buscaminas = (function () {

    let campoMinas;
    let perdida = true;
    let numLibres = 0;
    let columnasCampoMinas;
    let filasCampoMinas;
    let arrayLevantadas;

    function Casilla(valor, bandera = false, tapada = true) {
        this.valor = valor;
        this.bandera = bandera;
        this.tapada = tapada;
    }

    function init(dificultad = 1) {
        let numFilas;
        let numComlumnas;
        let numMinas;
        switch (dificultad) {
            case 2:
                numFilas = 16;
                numComlumnas = 16;
                numMinas = 30;
                break;
            case 3:
                numFilas = 30;
                numComlumnas = 30;
                numMinas = 99;
                break;
            //case 1:
            default:
                numFilas = 8;
                numComlumnas = 8;
                numMinas = 10;
                break;
        }
        crearTablero(numFilas, numComlumnas, numMinas);
        numLibres = numFilas * numComlumnas - numMinas;
        perdida = false;
        mostrarTableroJuego();
        return campoMinas;
    }

    function crearTablero(x, y, numMinas) {
        generaMatrizVacia(x, y);
        insertarMinas(numMinas);
    }

    function generaMatrizVacia(x, y) {
        let matriz = [];
        for (let i = 0; i < x; i++) {
            matriz[i] = []
            for (let j = 0; j < y; j++) {
                matriz[i][j] = new Casilla(0);
            }
        }
        campoMinas = matriz;
        filasCampoMinas = campoMinas.length - 1;
        columnasCampoMinas = campoMinas[1].length - 1;
    }

    function insertarMinas(numMinas) {
        let num1;
        let num2;
        for (let i = 0; i < numMinas; i++) {
            do {
                num1 = generaNumeroAleatorio(0, filasCampoMinas);
                num2 = generaNumeroAleatorio(0, columnasCampoMinas);
            } while (campoMinas[num1][num2].valor == 9)
            campoMinas[num1][num2].valor = 9;
        }
        actualizaTablero();
    }

    function actualizaTablero() {
        for (let i = 0; i < campoMinas.length; i++) {
            for (let j = 0; j < campoMinas[1].length; j++) {
                if (campoMinas[i][j].valor == 9) {
                    if (i != 0)
                        if (campoMinas[i - 1][j].valor !== 9)
                            campoMinas[i - 1][j].valor++;
                    if (i != filasCampoMinas)
                        if (campoMinas[i + 1][j].valor !== 9)
                            campoMinas[i + 1][j].valor++;
                    if (j != columnasCampoMinas)
                        if (campoMinas[i][j + 1].valor !== 9)
                            campoMinas[i][j + 1].valor++;
                    if (j != 0)
                        if (campoMinas[i][j - 1].valor !== 9)
                            campoMinas[i][j - 1].valor++;
                    if (j !== 0 && i !== filasCampoMinas)
                        if (campoMinas[i + 1][j - 1].valor !== 9)
                            campoMinas[i + 1][j - 1].valor++;
                    if (i != 0 && j != 0)
                        if (campoMinas[i - 1][j - 1].valor !== 9)
                            campoMinas[i - 1][j - 1].valor++;
                    if (i != filasCampoMinas && j != columnasCampoMinas)
                        if (campoMinas[i + 1][j + 1].valor !== 9)
                            campoMinas[i + 1][j + 1].valor++;
                    if (i != 0 && j != columnasCampoMinas)
                        if (campoMinas[i - 1][j + 1].valor !== 9)
                            campoMinas[i - 1][j + 1].valor++;
                }
            }
        }
    }

    function generaNumeroAleatorio(min, max) {
        return Math.round(Math.random() * (max - min) + min);
    }

    function picar(i, j) {
        comprobarDentroRango(i, j);

        if (campoMinas[i][j].bandera) {
            return;
        }
        if (campoMinas[i][j].valor == 9) {
            throw new Error("BOMM!!");
        }
        arrayLevantadas.push({
            i: i,
            j: j
        });
        if (!campoMinas[i][j].tapada) {
            return;
        }

        campoMinas[i][j].tapada = false;
        numLibres--;
        if (numLibres == 0) {
            throw new Error("Enhorabuena, has ganado.");
        }

        if (campoMinas[i][j].valor == 0) {
            if (i != 0)
                if (campoMinas[i - 1][j].tapada)
                    picar(i - 1, j);
            if (i != filasCampoMinas)
                if (campoMinas[i + 1][j].tapada)
                    picar(i + 1, j);
            if (j != columnasCampoMinas)
                if (campoMinas[i][j + 1].tapada)
                    picar(i, j + 1);
            if (j != 0)
                if (campoMinas[i][j - 1].tapada)
                    picar(i, j - 1);
            if (j !== 0 && i !== filasCampoMinas)
                if (campoMinas[i + 1][j - 1].tapada)
                    picar(i + 1, j - 1);
            if (i != 0 && j != 0)
                if (campoMinas[i - 1][j - 1].tapada)
                    picar(i - 1, j - 1);
            if (i != filasCampoMinas && j != columnasCampoMinas)
                if (campoMinas[i + 1][j + 1].tapada)
                    picar(i + 1, j + 1);
            if (i != 0 && j != columnasCampoMinas)
                if (campoMinas[i - 1][j + 1].tapada)
                    picar(i - 1, j + 1);
        }

    }

    function marcar(i, j) {
        comprobarDentroRango(i, j);
        if (!campoMinas[i][j].tapada) {
            throw new Error("No puedes poner una bandera en una casilla descubierta.");
        }
        campoMinas[i][j].bandera ? campoMinas[i][j].bandera = false : campoMinas[i][j].bandera = true;
    }

    function despejar(i, j) {
        let numBanderas = 0;

        if (campoMinas[i][j].tapada) {
            throw new Error("No puedes despejar una casilla tapada.");
        }

        if (i != 0)
            if (campoMinas[i - 1][j].bandera)
                numBanderas++;
        if (i != filasCampoMinas)
            if (campoMinas[i + 1][j].bandera)
                numBanderas++;
        if (j != columnasCampoMinas)
            if (campoMinas[i][j + 1].bandera)
                numBanderas++;
        if (j != 0)
            if (campoMinas[i][j - 1].bandera)
                numBanderas++;
        if (j !== 0 && i !== filasCampoMinas)
            if (campoMinas[i + 1][j - 1].bandera)
                numBanderas++;
        if (i != 0 && j != 0)
            if (campoMinas[i - 1][j - 1].bandera)
                numBanderas++;
        if (i != filasCampoMinas && j != columnasCampoMinas)
            if (campoMinas[i + 1][j + 1].bandera)
                numBanderas++;
        if (i != 0 && j != columnasCampoMinas)
            if (campoMinas[i - 1][j + 1].bandera)
                numBanderas++;

        if (numBanderas == campoMinas[i][j].valor) {
            if (i != 0)
                if (campoMinas[i - 1][j].tapada && !campoMinas[i - 1][j].bandera) {
                    picar(i - 1, j);
                    arrayLevantadas.push({
                        i: i - 1,
                        j: j
                    });
                }
            if (i != filasCampoMinas)
                if (campoMinas[i + 1][j].tapada && !campoMinas[i + 1][j].bandera) {
                    picar(i + 1, j);
                    arrayLevantadas.push({
                        i: i + 1,
                        j: j
                    });
                }
            if (j != columnasCampoMinas)
                if (campoMinas[i][j + 1].tapada && !campoMinas[i][j + 1].bandera) {
                    picar(i, j + 1);
                    arrayLevantadas.push({
                        i: i,
                        j: j + 1
                    });
                }
            if (j != 0)
                if (campoMinas[i][j - 1].tapada && !campoMinas[i][j - 1].bandera) {
                    picar(i, j - 1);
                    arrayLevantadas.push({
                        i: i,
                        j: j - 1
                    });
                }
            if (j !== 0 && i !== filasCampoMinas)
                if (campoMinas[i + 1][j - 1].tapada && !campoMinas[i + 1][j - 1].bandera) {
                    picar(i + 1, j - 1);
                    arrayLevantadas.push({
                        i: i + 1,
                        j: j - 1
                    });
                }
            if (i != 0 && j != 0)
                if (campoMinas[i - 1][j - 1].tapada && !campoMinas[i - 1][j - 1].bandera) {
                    picar(i - 1, j - 1);
                    arrayLevantadas.push({
                        i: i - 1,
                        j: j - 1
                    });
                }
            if (i != filasCampoMinas && j != columnasCampoMinas)
                if (campoMinas[i + 1][j + 1].tapada && !campoMinas[i + 1][j + 1].bandera) {
                    picar(i + 1, j + 1);
                    arrayLevantadas.push({
                        i: i + 1,
                        j: j + 1
                    });
                }
            if (i != 0 && j != columnasCampoMinas)
                if (campoMinas[i - 1][j + 1].tapada && !campoMinas[i - 1][j + 1].bandera) {
                    picar(i - 1, j + 1);
                    arrayLevantadas.push({
                        i: i - 1,
                        j: j + 1
                    });
                }
        }
    }

    function comprobarDentroRango(i, j) {
        if (i < 0 || j >= campoMinas.length) {
            throw new Error("Fuera de rango!");
        }
    }

    function picarCasilla(i, j) {
        arrayLevantadas = [];
        accionMostrando(i, j, picar);
        return arrayLevantadas;
    }

    function marcarCasilla(i, j) {
        accionMostrando(i, j, marcar);
        return campoMinas[i][j].bandera;
    }

    function despejarCasilla(i, j) {
        arrayLevantadas = [];
        accionMostrando(i, j, despejar);
        return arrayLevantadas;
    }

    function accionMostrando(i, j, funcion) {
        try {
            if (perdida) {
                throw new Error("Has perdido, inicia una partida.");
            }
            if (numLibres == 0) {
                throw new Error("Enhorabuena, has ganado.");
            }
            i = i;
            j = j;
            funcion(i, j);
            //mostrarTableroJuego();
        } catch (e) {
            if (e.message == "BOMM!!")
                perdida = true;
            throw new Error(e.message);
        }

    }

    function mostrarTableroJuego() {
        tablero = "  ";
        for (let i = 0; i < campoMinas.length; i++) {
            if (i == 0) {
                for (let j = 0; j < campoMinas[i].length; j++) {
                    if (j < 10) {
                        tablero += " ";
                    }
                    tablero += (j + 1) + " ";
                }
                tablero += "\n";
            }
            for (let j = -1; j < campoMinas[i].length; j++) {
                if (j === -1) {
                    if (i < 9) {
                        tablero += " ";
                    }
                    tablero += (i + 1) + " ";
                    continue;
                }
                pintarResultado(i, j);
            }
            tablero += "\n";
        }

        function pintarResultado(i, j) {
            if (campoMinas[i][j].tapada) {
                tablero += campoMinas[i][j].valor + "  ";
            } else if (campoMinas[i][j].bandera) {
                tablero += "╦ " + " ";
            } else
                tablero += "■ " + " ";
        }
        console.log(tablero);
    }

    return {
        init: init,
        mostrar: mostrarTableroJuego,
        picar: picarCasilla,
        marcar: marcarCasilla,
        despejar: despejarCasilla
    }
})();