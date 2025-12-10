//Definimos las variables globales que vamos a usar
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

            //Añadimos los eventos
            /*casilla.addEventListener('click', manejarClicIzquierdo);
            casilla.addEventListener('contextmenu', manejarClicDerecho);
            casilla.addEventListener('dblclick', manejarDobleClic);*/

            //Insertamos la casilla
            contenedorTablero.appendChild(casilla);
        }
    }

    contenedorTablero.addEventListener("click", function(e){
        if(e.target.classList.contains('casilla')){
            /*e.target.textContent = "B";*/
            manejarClicIzquierdo(e);
        }
    });
}

//Una función para obtener una casilla del DOM por coordenadas
function obtenerCasillaDOM(fila, columna) {
    return document.querySelector(`[data-fila="${fila}"][data-columna="${columna}"]`);
}

// Lógica de click izquierdo (Descubrir)
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

// Lógica de click derecho (Bandera)
function manejarClicDerecho(e) {
    e.preventDefault(); // Evitar el menú contextual del navegador [cite: 34]
    if (!vivo) return;

    const casilla = e.currentTarget;

    // Solo podemos marcar/desmarcar si no está revelada
    if (!casilla.classList.contains('revelada')) {
        casilla.classList.toggle('bandera');
        casilla.textContent = casilla.classList.contains('bandera') ? '🚩' : ''; // Emoji de bandera
    }
}

// Lógica de doble click (Quitar Bandera)
function manejarDobleClic(e) {
    if (!vivo) return;
    const casilla = e.currentTarget;
    
    // Solo si tiene bandera, se quita (ya cubierta por toggle, pero se asegura) [cite: 29]
    if (casilla.classList.contains('bandera')) {
        casilla.classList.remove('bandera');
        casilla.textContent = '';
    }
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
        casillaDOM.textContent = '💣';
        finalizarJuego(false);

        //Salimos de la función
        return;
    } 
    
    //Si no es bomba, revelamos la casilla actual
    casillaDOM.classList.remove('sinRevelar');
    casillaDOM.classList.add('revelada');
    casillasRestantes--;

    casillaDOM.classList.add(`${numeros[valor]}`);

    /*switch(valor){
        case 0:
            casillaDOM.classList.add(`${numeros[valor]}`);
            break;
        case 1:
            break;
        case 2:
            break;
        case 3:
            break;
        case 4:
            break;
        case 5:
            break;
        case 6:
            break;
        case 7:
            break;
        case 8:
            break;
    }*/

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
    /*
    //Como sólo entramos a la función cuando encontramos un 0, sabemos que lo primero es revelar la casilla central
    let resultado = contarMinasAdyacentes(casilla, mapa);
    casilla.textContent = resultado;
    casillasRestantes--;*/

    //Un bucle para comprobar las adyacentes
    for(let posX of margenX){
        for(let posY of margenY){
            /*const selector =  `[data-fila="${posX}"][data-columna="${posY}"]`;
            let casilla2 = document.querySelector(selector);
            //Entramos sólo a casillas sin revelar y que no sean bomba
            if(resultado[posX][posY] == "X" && mapa[posX][posY] != "*"){ 
                numero = contarMinasAdyacentes(mapa, posX, posY);
                if(numero === 0){ //Llamamos recursivamente a la función si encontramos casillas sin revelar que sean 0
                    resultado = mostrarCasillasAdyacentesVaciasONumericas(mapa, resultado, posX, posY);
                } else { //Si no son 0 ni están reveladas, las revelamos y decrementamos el contador para victoria
                    resultado[posX][posY] = numero;
                    casillasRestantes--;
                }
            }*/

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

/*
//Pedimos el tamaño del tablero al usuario
numFilas = parseInt(prompt("Introduce el número de filas del tablero (mínimo 2) (colocaremos un número de bombas igual al 20% del número de casillas): "));
while(isNaN(numFilas) || numFilas < 2){
    numFilas = parseInt(prompt("El número de filas del tablero debe ser mayor o igual que 1. Introdúcelo de nuevo: "));
}*/




/*
//Más variables que vamos a usar
let progreso = generarMapa();
mapa = generarMapa();
numBombas = parseInt((numFilas*numFilas)/5);
casillasRestantes = numFilas * numFilas - numBombas;
mapa = colocarMinas(mapa, numBombas);
console.log("El mapa de minas es:");
console.table(mapa);*/

//Mientras no hayamos revelado una bomba, seguimos jugando
/*while(vivo){
    jugar();

    //Si ya no quedan más casillas por revelar, se termina la partida
    if(casillasRestantes === 0){
        break;
    }
}*/

//En lugar de usar prompt, usamos el formulario de inicio
btnIniciar.addEventListener('click', inicializarJuego);
const tablero = document.getElementById('tablero-visual');
/*tablero.addEventListener("click", function(e){
    casilla = e.target.closest(".casilla");
    const 
    revelarCasilla(casilla);
});*/

/*
//Mostramos el tablero final
console.log("Estado final del tablero: ");
console.table(progreso);

//Mensaje final diferenciando si hemos ganado o perdido
if(vivo){
    console.log("¡Felicidades! ¡Has ganado!");
} else {
    console.log("¡Has perdido! Mejor suerte la próxima vez.");
}*/