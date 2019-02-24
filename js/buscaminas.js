let buscaminas = (function () {

    /**
     * Variable en la que guardamos la matriz del juego
     */
    let campoMinas,
        /**
         * Variable que controla si el jugador ha perdido ya o no.
         */
        perdida = true,
        /**
         * Variable para controlar la victoria, en ella vamos 
         * a contar el numero de casillas que quedan por descubrir
         */
        numLibres = 0,
        /**
         * Columnas de la matriz del campo de minas
         */
        columnasCampoMinas,
        /**
         * Filas de la matriz del campo de minas
         */
        filasCampoMinas,
        /**
         * Array con las cordenadas de las casillas picadas.
         */
        arrayLevantadas,
        /**
         * Array donde vamos a guardar las coordenadas de las casillas circundantes a una
         * especificada.
         */
        arrayCircundantes,
        /**
         * Array con las coordenadas de las minas.
         */
        arrayPosicionMinas = [],
        /**
         * Variable que vamos a usar para contar las minas circundantes
         */
        numBanderasCircundantes;

    /**
     * Cada una de los elementos de la matriz que compone el juego
     * @param {Valor numerico de la casilla} valor 
     * @param {Booleano que indica si tiene o no bandera} bandera 
     * @param {Booleano que indica si está o no tapada} tapada 
     */
    function Casilla(valor, bandera = false, tapada = true) {
        this.valor = valor;
        this.bandera = bandera;
        this.tapada = tapada;
    }

    /**
     * Función inicial. Inicia el juego en tres dificultades.
     * @param {Define el grado de dificultad del juego} dificultad 
     */
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
            default:
                numFilas = 8;
                numComlumnas = 8;
                numMinas = 3;
                break;
        }
        arrayPosicionMinas = [];
        crearTablero(numFilas, numComlumnas, numMinas);
        numLibres = numFilas * numComlumnas - numMinas;
        perdida = false;
        mostrarTableroJuego();
        return campoMinas;
    }

    /**
     * Funcion que genera la matriz e inserta la minas
     * @param {numero de filas} x 
     * @param {numero de columnas} y 
     * @param {numero de minas} numMinas 
     */
    function crearTablero(x, y, numMinas) {
        generaMatrizVacia(x, y);
        insertarMinas(numMinas);
    }

    /**
     * Genera una matriz de Casillas con el valor 0.(Ver clase casilla en la parte 
     * superior)
     */
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

    /**
     * Función que inserta la minas en lugares aleatorios y actualiza los valores
     * que debe tener el tablero
     */
    function insertarMinas(numMinas) {
        let num1;
        let num2;
        for (let i = 0; i < numMinas; i++) {
            do {
                num1 = generaNumeroAleatorio(0, filasCampoMinas);
                num2 = generaNumeroAleatorio(0, columnasCampoMinas);
            } while (campoMinas[num1][num2].valor === 9)
            arrayPosicionMinas.push({
                i: num1,
                j: num2
            });
            campoMinas[num1][num2].valor = 9;
        }
        actualizaTablero();
    }
    /**
     * Genera un numero aleatorio entre un mínimo y un máximo
     */
    function generaNumeroAleatorio(min, max) {
        return Math.round(Math.random() * (max - min) + min);
    }

    /**
     * Recorre el array de minas para definir los valores de las casillas colindantes.
     */
    function actualizaTablero() {
        for (posicionMinas of arrayPosicionMinas) { //Recorro el array donde están las minas
            recorrerAdyacentes(posicionMinas.i, posicionMinas.j, aniadirValoresAdyacentesALaMina);
        }
    }

    /**
     * Dadas la coordenada x, la coordenada 'y' y una funcionalidad que hacer, aplica a las casillas
     * adyacentes a la proporcionada la funcionalidad definida.
     * @param {coordenada x} indiceFilas 
     * @param {coordenada y} indiceColumnas 
     * @param {funcionalidad a aplicar a las casillas colindantes} callback 
     */
    function recorrerAdyacentes(indiceFilas, indiceColumnas, callback) {
        for (let i = Math.max((indiceFilas - 1), 0); i <= Math.min((indiceFilas + 1), filasCampoMinas); i++) { // Recorro la posición i, desde i-1 hasta i+1, evitando que se salga de rango
            for (let j = Math.max((indiceColumnas - 1), 0); j <= Math.min((indiceColumnas + 1), columnasCampoMinas); j++) { //Analogo a la i, recorro la j.
                callback(i, j);
            }
        }
    }
    /**
     * Funcionalidad que suma uno al valor de una una casilla si no es una mina
     * (Esto se debe aplicar alrededor de una mina al comienzo de la partida)
     * @param {Coordenada x} i 
     * @param {Coordenada y} j 
     */
    function aniadirValoresAdyacentesALaMina(i, j) {
        if (campoMinas[i][j].valor === 9)
            return;
        campoMinas[i][j].valor++;
    }


    /**
     * Pica una casilla y, en el caso en el que su valor sea cero, se llama recursivamente
     * para picar las casillas colindantes.
     * @param {Coordenada x} i 
     * @param {Coordenada y} j 
     */
    function picar(i, j) {
        comprobarDentroRango(i, j);
        if (campoMinas[i][j].bandera || !campoMinas[i][j].tapada) {
            return;
        }
        if (campoMinas[i][j].valor === 9) {
            throw new Error("BOMM!!");
        }

        arrayLevantadas.push({
            i: i,
            j: j
        });
        campoMinas[i][j].tapada = false;
        numLibres--;

        if (numLibres === 0) {
            throw new Error("Enhorabuena, has ganado.");
        }
        if (campoMinas[i][j].valor === 0) {
            recorrerAdyacentes(i, j, picar)
        }
    }

    /**
     * Marca una casilla
     * @param {Coordenada x} i 
     * @param {Coordenada y} j 
     */
    function marcar(i, j) {
        comprobarDentroRango(i, j);
        if (!campoMinas[i][j].tapada) {
            throw new Error("No puedes poner una bandera en una casilla descubierta.");
        }
        campoMinas[i][j].bandera = campoMinas[i][j].bandera ? false : true;
    }
    /**
     * Ayuda que cuenta las banderas colindantes, en caso de que el número de banderas
     * sea igual al valor de la casilla, pica las casillas obvias.
     * @param {Coordenada x} i 
     * @param {Coordenada y} j 
     */
    function despejar(i, j) {
        numBanderasCircundantes = 0;
        if (campoMinas[i][j].tapada) {
            throw new Error("No puedes despejar una casilla tapada.");
        }
        recorrerAdyacentes(i, j, contarBanderasCircundantes);
        if (numBanderasCircundantes === campoMinas[i][j].valor) {
            arrayCircundantes = [];
            recorrerAdyacentes(i, j, picarCasillaObvia);
        }
    }
    /**
     * Aumenta el numero de banderas si la casilla proporcionada tiene una bandera, en
     * caso contrario rellena un array con la coordenada de las casillas
     * @param {Coordenada x} i 
     * @param {Coordenada y} j 
     */
    function contarBanderasCircundantes(i, j) {
        if (campoMinas[i][j].bandera)
            numBanderasCircundantes++;
        else
            arrayCircundantes.push({
                i: i,
                j: j
            });

    }
    /**
     * Si la casilla proporcionada está tapada y no tiene una bandera, la pica
     * @param {Coordenada x} i 
     * @param {Coordenada y} j 
     */
    function picarCasillaObvia(i, j) {
        if (campoMinas[i][j].tapada && !campoMinas[i][j].bandera)
            picar(i, j);
    }

    /**
     * Si la casilla cuyas coordenadas proporcionadas esta fuera del rango
     * de nuestro campo de minas, salta una excepción
     * @param {Coordenada x} i 
     * @param {Coordenada y} j 
     */
    function comprobarDentroRango(i, j) {
        if (i < 0 || j >= campoMinas.length) {
            throw new Error("Fuera de rango!");
        }
    }
    /**
     * Pica la casilla proporcionada.
     * @param {Coordenada x} i 
     * @param {Coordenada y} j 
     * @returns {Array con las coordenadas de las casillas picadas} arrayLevantadas
     */
    function picarCasilla(i, j) {
        arrayLevantadas = [];
        accionMostrando(i, j, picar);
        return arrayLevantadas;
    }
    /**
     * Marca una casilla especificada
     * @param {Coordenada x} i 
     * @param {Coordenada y} j
     * @returns {Boleano, true en caso de que tenga una bandera,false en caso contrario} campoMinas[i][j].bandera
     */
    function marcarCasilla(i, j) {
        accionMostrando(i, j, marcar);
        return campoMinas[i][j].bandera;
    }
/**
 * Pica las casillas colindantes a las proporcionadas en caso de que sea obvio que no
 * son minas. 
 * @param {Coordenada x} i 
 * @param {Coordenada y} j 
 * @returns {Coordenadas de la casillas picadas} arrayLevantadas,
 * @returns {Coordenadas de las casillas circundantes a la proporcionada} arrayCircundantes
 */
    function despejarCasilla(i, j) {
        arrayLevantadas = [];
        arrayCircundantes = [];
        accionMostrando(i, j, despejar);
        return [arrayLevantadas, arrayCircundantes];
    }
/**
 * Aplica una funcionalidad definida a una coordenada proporcionada, comprueba si 
 * salta algún error definido en el juego y lo lanza para que se pueda recoger fuera
 * @param {Coordenada x} i 
 * @param {Coordenada y} j 
 * @param {Funcionalidad que le vamos a aplicar a la casilla proporcionada} funcion 
 */
    function accionMostrando(i, j, funcion) {
        try {
            if (perdida) {
                throw new Error("Has perdido, inicia una partida.");
            }
            if (numLibres === 0) {
                throw new Error("Enhorabuena, has ganado.");
            }
            funcion(i, j);
        } catch (e) {
            if (e.message === "BOMM!!")
                perdida = true;
            else if (e.message === "Enhorabuena, has ganado.") {
                let error = new Error("Enhorabuena, has ganado.");
                error.arrayLevantadas = arrayLevantadas;
                throw error;
            }
            throw new Error(e.message);
        }

    }
    /**
     * Muestra por consola el tablero del juego
     */
    function mostrarTableroJuego() {
        tablero = "  ";
        for (let i = 0; i < campoMinas.length; i++) {
            if (i === 0) {
                for (let j = 0; j < campoMinas[i].length; j++) {
                    if (j < 10) {
                        tablero += " ";
                    }
                    //tablero += (j + 1) + " ";
                    tablero += (j) + " ";
                }
                tablero += "\n";
            }
            for (let j = -1; j < campoMinas[i].length; j++) {
                if (j === -1) {
                    if (i < 9) {
                        tablero += " ";
                    }
                    tablero += (i) + " ";
                    // tablero += (i + 1) + " ";
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