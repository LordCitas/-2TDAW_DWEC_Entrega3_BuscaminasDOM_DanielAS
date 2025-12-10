//Definimos las variables que vamos a usar
let numFilas, ronda = 0, vivo = true, mapa, numBombas, casillasRestantes;
const contenedorTablero = document.getElementById('tablero-visual');
const mensajeJuego = document.getElementById('mensaje-juego');
const inputTamano = document.getElementById('input-tamano');
const btnIniciar = document.getElementById('btn-iniciar');
const numeros = {
    "0" : "fondo0",
    "1" : "fondo1",
    "2" : "fondo2",
    "3" : "fondo3",
    "4" : "fondo4",
    "5" : "fondo5",
    "6" : "fondo6",
    "7" : "fondo7",
    "8" : "fondo8",
}

//Una función para generar el tablero inicial
function generarMapa(){
    //Definimos las variables que necesitamos
    let mapaInicial = [], fila = [];

    //Un bucle que genera la matriz
    for(let i=0; i<numFilas; i++){
        //Inicializamos el array de la fila a vacío
        fila = [];
        for(let j=0; j<numFilas; j++){ //Pusheamos a la fila tantas casillas como necesitemos
            fila.push("X");
        }
        //Pusheamos la nueva fila a la matriz
        mapaInicial.push(fila);
    }
    //Devolvemos la matriz creada
    return mapaInicial;
}

//Una función para colocar las minas en el tablero
function colocarMinas(mapa, numBombas){
    //Hacemos una copia del mapa y definimos las variables que necesitamos
    let resultado = [].concat(mapa), temp, x, y;

    //Un bucle que genere un número aleatorio que seleccione una casilla del mapa para colocar bomba,
    //y repita la iteración en caso de encontrarse una 
    for(let i=0; i<numBombas; i++){
        temp = Math.floor(Math.random() * numFilas * numFilas);
        x = parseInt(temp/numFilas);
        y = temp%numFilas;
        (resultado[x][y] == "X")? resultado[x][y] = "*" : i--;
    }
    //Devolvemos la copia del mapa
    return resultado;
}

//Una función para generar márgenes para cursar las casillas adyacentes
function generarMargen(n){
    //Generamos un array vacío
    let margen = [];
    //Diferenciamos el tamaño y valores del array en función del número introducido
    switch(n){
        case 0:
            margen = [n, n+1];
        break;
        case numFilas-1:
            margen = [n-1, n];
        break;
        default:
            margen = [n-1, n, n+1];
        break;
    }
    //Devolvemos el array generado
    return margen;
}

//Una función para contar las minas adyacentes a una casilla
function contarMinasAdyacentes(mapa, x, y){
    //Definimos las variables que necesitamos
    let contador = 0, margenX = [], margenY = [];

    //Generamos márgenes para fila y columna
    margenX = generarMargen(x);
    margenY = generarMargen(y);

    //Recorremos todas las posiciones y vamos contando las bombas
    for(let posX of margenX){
        for(let posY of margenY){
            if(mapa[posX][posY] == "*" && !(posX == x && posY == y)){
                contador++;
            }
        }
    }
    //Devolvemos el valor que hayamos acumulado
    return contador;
}

//Una función para inicializar el juego
function inicializarJuego(){
    numFilas = parseInt(inputTamano.value);
    if (isNaN(numFilas) || numFilas < 2){
        alert("El tamaño del tablero debe ser un número mayor o igual a 2.");
        return;
    }

    //Reiniciamos las variables
    vivo = true;
    contenedorTablero.innerHTML = '';
    contenedorTablero.classList.remove('bloqueado');
    
    //Inicializamos las variables de control del juego
    numBombas = parseInt((numFilas * numFilas) / 5);
    casillasRestantes = numFilas * numFilas - numBombas;

    //Generamos el mapa y le colocamos las minas
    mapa = generarMapa();
    mapa = colocarMinas(mapa, numBombas);
    
    //Rellenamos las casillas sin minas con el número de minas adyacentes
    for (let i = 0; i < numFilas; i++) {
        for (let j = 0; j < numFilas; j++) {
            if (mapa[i][j] === "X") {
                mapa[i][j] = contarMinasAdyacentes(mapa, i, j);
            }
        }
    }
    
    //Generamos el tablero en el DOM
    generarTableroHTML();
    mensajeJuego.textContent = '¡Comienza la partida!';
}

function generarTableroHTML(){
    const longitud = 850/numFilas;
    contenedorTablero.style.gridTemplateColumns = `repeat(${numFilas}, ${longitud}px)`;
    contenedorTablero.style.gridTemplateRows = `repeat(${numFilas}, ${longitud}px)`;
    contenedorTablero.style.fontSize = `${(1/2)*longitud}px`;
    
    for (let i = 0; i < numFilas; i++) {
        for (let j = 0; j < numFilas; j++) {
            const casilla = document.createElement('div');
            casilla.classList.add('casilla');
            casilla.classList.add('sinRevelar');
            
            //Usamos atributos data- para almacenar las coordenadas
            casilla.dataset.fila = i;
            casilla.dataset.columna = j;

            //Insertamos la casilla
            contenedorTablero.appendChild(casilla);
        }
    }

    contenedorTablero.addEventListener("click", function(e){
        if(e.target.classList.contains('casilla')){
            manejarClicIzquierdo(e);
        }
    });

    contenedorTablero.addEventListener("contextmenu", function(e){
        if(e.target.classList.contains('casilla')){
            manejarClicDerecho(e);
        }
    });

    contenedorTablero.addEventListener("dblclick", function(e){
        if(e.target.classList.contains('casilla')){
            manejarDobleClic(e);
        }
    });
}

//Una función para obtener una casilla del DOM por coordenadas
function obtenerCasillaDOM(fila, columna) {
    return document.querySelector(`[data-fila="${fila}"][data-columna="${columna}"]`);
}

//Una función para controlar el clic izquierdo para revelar casillas
function manejarClicIzquierdo(e) {
    if(!vivo){
        return;
    }

    const casilla = e.target;

    // No se puede descubrir si ya está revelada o tiene bandera 
    if (casilla.classList.contains('revelada') || casilla.classList.contains('bandera')) {
        return;
    }

    const x = parseInt(casilla.dataset.fila);
    const y = parseInt(casilla.dataset.columna);

    revelarCasilla(x, y);
}

//Una función para controlar el clic derecho para poner y quitar "banderas"
function manejarClicDerecho(e) {
    e.preventDefault(); //Evitamos el menú contextual del navegador
    if(!vivo){
        return;
    }

    const casilla = e.target;

    // Solo podemos marcar/desmarcar si no está revelada
    if (!casilla.classList.contains('revelada')) {
        casilla.classList.toggle('bandera');
    }
}

//Una función para controlar el doble clic izquierdo para revelar casillas adyacentes
//cuando ya hayamos marcado las suficientes "banderas"
function manejarDobleClic(e) {
    if(!vivo){
        return;
    }
    const casilla = e.currentTarget;
    
    let x = parseInt(casilla.dataset.fila);
    let y = parseInt(casilla.dataset.columna);

    let margenX = generarMargen(x), margenY = generarMargen(y), contador = 0;

    for(let posX of margenX){
        for(let posY of margenY){
            if(!(posX == x && posY == y) && mapa[posX][posY] == "*"){
                contador++;
            }
        }
    }

    //Si contamos un número de "banderas" distinto al de bombas adyacentes, no hacemos nada y salimos
    if(!mapa[x][y] == contador){
        return;
    }

    //En caso contrario, revelamos las casillas adyacentes
    mostrarCasillasAdyacentesVaciasONumericas(x, y);
}

//Una función para revelar una casilla
function revelarCasilla(x, y){
    //Obtenemos la casilla del DOM
    let casillaDOM = obtenerCasillaDOM(x, y);
    
    //Salimos si la casilla ya está revelada o tiene bandera
    if(casillaDOM.classList.contains('revelada') || casillaDOM.classList.contains('bandera')) {
        return; 
    }

    //Obtenemos el valor de la casilla del mapa ("X" o "*")
    const valor = mapa[x][y];

    //Si revelamos una bomba, perdemos
    if(valor === "*"){
        vivo = false;
        casillaDOM.classList.add('mina');
        casillaDOM.classList.toggle('mina');
        finalizarJuego(false);

        //Salimos de la función
        return;
    } 
    
    //Si no es bomba, revelamos la casilla actual
    casillaDOM.classList.remove('sinRevelar');
    casillaDOM.classList.add('revelada');
    casillasRestantes--;

    casillaDOM.classList.add(`${numeros[valor]}`);

    if(valor > 0){
        //Si es un número
        casillaDOM.textContent = valor;
    }else{
        //Es un 0 -> Llamada recursiva para expansión
        //Llama a la versión adaptada para DOM
        mostrarCasillasAdyacentesVaciasONumericas(x, y);
    }

    // Comprobar victoria
    if (casillasRestantes === 0) {
        finalizarJuego(true); // Todas las casillas no-mina están descubiertas 
    }
}

//Una función para mostrar las casillas adyacentes vacías o numéricas
function mostrarCasillasAdyacentesVaciasONumericas(x, y){
    //Generamos márgenes
    let margenX = generarMargen(x), margenY = generarMargen(y);

    //Un bucle para comprobar las adyacentes
    for(let posX of margenX){
        for(let posY of margenY){

            //Saltamos la iteración cuando entramos a la casilla central
            if(posX == x && posY == y){
                continue;
            }

            const casillaAdyacente = obtenerCasillaDOM(posX, posY);

            if (!casillaAdyacente) {
                continue;
            }

            //Solo trabajamos con casillas que no estén reveladas ni tengan bandera
            if(!casillaAdyacente.classList.contains('revelada') && !casillaAdyacente.classList.contains('bandera')){
                
                const valorAdyacente = mapa[posX][posY];
                

                if(valorAdyacente === 0){
                    //Recursividad para el 0
                    revelarCasilla(posX, posY); 
                }else if(valorAdyacente > 0){ 
                    //Si es numérica, la revelamos y terminamos la cadena por aquí
                    casillaAdyacente.classList.add('revelada');
                    casillaAdyacente.textContent = valorAdyacente;
                    casillasRestantes--;

                    casillaAdyacente.classList.remove('sinRevelar');
                    casillaAdyacente.classList.add(`${numeros[valorAdyacente]}`);
                }
                //Si fuera una mina, ya se descartó en la función principal
            }
        }
    }
}

//Una función para terminar la partida
function finalizarJuego(victoria) {
    contenedorTablero.classList.add('bloqueado');
    
    //Mostramos todas las minas
    for(let i = 0; i<numFilas; i++){
        for(let j = 0; j<numFilas; j++){
            const casilla = obtenerCasillaDOM(i, j);
            if (mapa[i][j] === "*" && !casilla.classList.contains('mina')){
                casilla.classList.toggle('mina');
            }
        }
    }

    if(victoria){
        mensajeJuego.textContent = "¡Enhorabuena, has ganado!";
    }else{
        mensajeJuego.textContent = "¡BOOM! Has perdido. Mejor suerte la próxima vez.";
    }
}

//En lugar de usar prompt, usamos el formulario de inicio
btnIniciar.addEventListener('click', inicializarJuego);
const tablero = document.getElementById('tablero-visual');
