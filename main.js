//Definimos las variables que vamos a usar
let numFilas, ronda = 0, vivo = true, mapa, numBombas, casillasRestantes;

//Los elementos del DOM que vamos a ir modificando
const contenedorTablero = document.getElementById('tablero-visual');
const mensajeJuego = document.getElementById('mensaje-juego');
const inputTamano = document.getElementById('input-tamano');
const btnIniciar = document.getElementById('btn-iniciar');

//Un array asociativo para it cambiando clases
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
    if(isNaN(numFilas) || numFilas < 2){
        alert("El tamaño del tablero debe ser un número mayor o igual a 2.");
        return;
    }

    //Reiniciamos las variables
    vivo = true;
    contenedorTablero.innerHTML = '';
    contenedorTablero.classList.remove('bloqueado');
    
    //Inicializamos las variables de control del juego
    numBombas = parseInt((numFilas * numFilas)/5);
    casillasRestantes = numFilas * numFilas - numBombas;

    //Generamos el mapa y le colocamos las minas
    mapa = generarMapa();
    mapa = colocarMinas(mapa, numBombas);
    
    //Rellenamos las casillas sin minas con el número de minas adyacentes
    for(let i=0; i<numFilas; i++){
        for(let j=0; j<numFilas; j++){
            if(mapa[i][j] === "X"){
                mapa[i][j] = contarMinasAdyacentes(mapa, i, j);
            }
        }
    }
    
    //Generamos el tablero en el DOM
    generarTableroHTML();
    mensajeJuego.textContent = '¡Comienza la partida!';
}

//Una función para generar el contenido del contenedor-tablero del html
//Le vamos a insertar todas las casillas
function generarTableroHTML(){
    //Calculamos la dimensión de las casillas y la fuente y se la asignamos a los atributos correspondientes
    const longitud = 850/numFilas;
    contenedorTablero.style.gridTemplateColumns = `repeat(${numFilas}, ${longitud}px)`;
    contenedorTablero.style.gridTemplateRows = `repeat(${numFilas}, ${longitud}px)`;
    contenedorTablero.style.fontSize = `${(1/2)*longitud}px`;

    //Reseteamos los colores que indican si ganamos o perdemos
    contenedorTablero.classList.add("sombraNegra");
    contenedorTablero.classList.remove("sombraRoja");
    contenedorTablero.classList.remove("sombraVerde");
    mensajeJuego.setAttribute("style", "color:yellow");
    
    //Un bucle para ir creando las casillas
    for(let i=0; i<numFilas; i++){
        for(let j=0; j<numFilas; j++){
            //Creamos el elemento casilla y le insertamos las clases necesarias
            const casilla = document.createElement('div');
            casilla.classList.add('casilla'); //Para dimensiones
            casilla.classList.add('sinRevelar'); //Para fondos y comprobaciones lógicas
            
            //Usamos atributos data- para almacenar las coordenadas
            casilla.dataset.fila = i;
            casilla.dataset.columna = j;

            //Insertamos la casilla
            contenedorTablero.appendChild(casilla);
        }
    }

    //Al mismo tiempo que creamos el tablero, debemos ponerle los listeners que vamos a usar, delegando para los hijos (casilla)
    //Un listener para revelar casillas con click izquierdo
    contenedorTablero.addEventListener("click", function(e){
        if(e.target.classList.contains('casilla')){
            manejarClicIzquierdo(e);
        }
    });

    //Un listener para poner y quitar banderas
    //No sé por qué, pero al resetear el tablero me deja de funcionar el listener
    contenedorTablero.addEventListener("contextmenu", function(e){
        if(e.target.classList.contains('casilla')){
            manejarClicDerecho(e);
        }
    });

    //Un listener para revelar las casillas adyacentes que (según el criterio del jugador) no tienen bomba
    contenedorTablero.addEventListener("dblclick", function(e){
        if(e.target.classList.contains('casilla')){
            manejarDobleClic(e);
        }
    });
}

//Una función para obtener una casilla del DOM por coordenadas
function obtenerCasillaDOM(fila, columna){
    return document.querySelector(`[data-fila="${fila}"][data-columna="${columna}"]`);
}

//Una función para controlar el clic izquierdo para revelar casillas
function manejarClicIzquierdo(e){
    //Si hemos muerto, no hacemos nada
    if(!vivo){
        return;
    }

    //Guardamos la casilla que ha llamado al listener
    const casilla = e.target;

    //No se puede descubrir si ya está revelada o tiene bandera 
    if (casilla.classList.contains('revelada') || casilla.classList.contains('bandera')){
        return;
    }

    //Debemos acceder a las coordenadas de la casilla para poder pasárselas a revelarCasilla
    const x = parseInt(casilla.dataset.fila);
    const y = parseInt(casilla.dataset.columna);
    revelarCasilla(x, y);
}

//Una función para controlar el clic derecho para poner y quitar "banderas"
function manejarClicDerecho(e){
    //Evitamos el menú contextual del navegador
    e.preventDefault(); 

    //Si hemos muerto, no hacemos nada
    if(!vivo){
        return;
    }

    //Guardamos la casilla que ha llamado al listener
    const casilla = e.target;

    //Sólo la podemos marcar/desmarcar si no está revelada
    if (!casilla.classList.contains('revelada')){
        casilla.classList.toggle('bandera');
    }
}

//Una función para controlar el doble clic izquierdo para revelar casillas adyacentes
//cuando ya hayamos marcado las suficientes "banderas"
function manejarDobleClic(e) {
    //Si hemos muerto, no hacemos nada
    if(!vivo){
        return;
    }

    //Guardamos la casilla que ha llamado al listener
    const casilla = e.target;
    
    //Debemos acceder a las coordenadas de la casilla para poder pasárselas a generarMargen
    let x = parseInt(casilla.dataset.fila);
    let y = parseInt(casilla.dataset.columna);
    let margenX = generarMargen(x), margenY = generarMargen(y), contador = 0;

    //Una vez tenemos los márgenes, los recorremos
    for(let posX of margenX){
        for(let posY of margenY){
            const nuevaCasilla = obtenerCasillaDOM(posX, posY);
            //Ignoramos la casilla central y contamos las banderas dentro de los márgenes
            if(!(posX == x && posY == y) && nuevaCasilla.classList.contains("bandera")){
                contador++;
            }
        }
    }

    //Si contamos un número de "banderas" distinto al de bombas adyacentes, no hacemos nada y salimos
    if(mapa[x][y] != contador){
        return;
    }

    //En caso contrario, revelamos las casillas adyacentes
    //No podemos usar el mostrarCasillas...Numericas porque no revela bombas si nos equivocamos
    for(let posX of margenX){
        for(let posY of margenY){
            //Debemos comprobar que las casillas que cursamos no estén ya reveladas ni tengan bandera
            const nuevaCasilla = obtenerCasillaDOM(posX, posY);
            if(!(posX == x && posY == y) && !nuevaCasilla.classList.contains("bandera") && !nuevaCasilla.classList.contains("revelado")){
                //Si la casilla no es la central, no tiene bandera ni está revelada, la revelamos
                revelarCasilla(posX, posY);
            }
        }
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

    //Obtenemos el valor de la casilla del mapa
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
    //Le atribuimos las clases necesarias
    casillaDOM.classList.remove('sinRevelar');
    casillaDOM.classList.add('revelada');
    casillasRestantes--;
    casillaDOM.classList.add(`${numeros[valor]}`);

    if(valor > 0){ //Si es un número mayor que 0
        casillaDOM.textContent = valor;
    }else{
        //Si es 0, hacemos una lamada recursiva a mostrarAdyacentes
        mostrarCasillasAdyacentesVaciasONumericas(x, y);
    }

    //Si todas las casillas no-bomba están descubiertas, terminamos el juego
    if(casillasRestantes === 0){
        finalizarJuego(true);
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

            //Obtenemos la casilla adyacente desde el DOM
            const casillaAdyacente = obtenerCasillaDOM(posX, posY);

            //Si no la encontramos, salimos de la función
            if (!casillaAdyacente) {
                continue;
            }

            //Solo trabajamos con casillas que no estén reveladas ni tengan bandera
            if(!casillaAdyacente.classList.contains('revelada') && !casillaAdyacente.classList.contains('bandera')){
                //Guardamos el valor de la casilla seleccionada
                const valorAdyacente = mapa[posX][posY];
                
                //Si es 0, revelamos la casilla ()
                if(valorAdyacente === 0){
                    //Recursividad para el 0
                    revelarCasilla(posX, posY); 
                }else if(valorAdyacente > 0){ 
                    //Si es numérica, la revelamos en el DOM y le añadimos las clases necesarias
                    casillaAdyacente.classList.add('revelada');
                    casillaAdyacente.textContent = valorAdyacente;
                    casillasRestantes--;

                    casillaAdyacente.classList.remove('sinRevelar');
                    casillaAdyacente.classList.add(`${numeros[valorAdyacente]}`);
                }
            }
        }
    }
}

//Una función para terminar la partida
function finalizarJuego(victoria) {
    //Un bucle que va mostrando todas las minas
    for(let i = 0; i<numFilas; i++){
        for(let j = 0; j<numFilas; j++){
            const casilla = obtenerCasillaDOM(i, j);
            if (mapa[i][j] === "*" && !casilla.classList.contains('mina')){
                casilla.classList.toggle('mina');
            }
        }
    }

    //El final el distinto dependiendo de si hemos ganado o perdido
    if(victoria){
        //Editamos el mensaje informativo y le aplicamos (y quitamos) clases
        mensajeJuego.textContent = "¡Enhorabuena, has ganado!";
        mensajeJuego.setAttribute("style", "color:lime");
        contenedorTablero.classList.add("sombraVerde");
        contenedorTablero.classList.remove("sombraNegra");
    }else{
        //Editamos el mensaje informativo y le aplicamos (y quitamos) clases
        mensajeJuego.textContent = "¡BOOM! Has perdido. Mejor suerte la próxima vez.";
        mensajeJuego.setAttribute("style", "color:red");
        contenedorTablero.classList.add("sombraRoja");
        contenedorTablero.classList.remove("sombraNegra");
    }
}

//En lugar de usar prompt, usamos el formulario de inicio
btnIniciar.addEventListener('click', inicializarJuego);