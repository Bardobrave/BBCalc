function go() {
	/* TO DO: Añadir handlers para eventos touch en drag and drop y que funcione en el móvil */	
	/* La calculadora gestiona el interfaz que crea y calcula las jugadas */
	var diceSides = { '2': 'dos', '3': 'tres', '4': 'cuatro', '5': 'cinco', '6': 'seis',
		'block3Dis': '3blockrivalchoose', 'block2Dis':'2blockrivalchoose', 'block1Ad': 'block', 
		'block2Ad': '2blockyouchoose', 'block3Ad': '3blockyouchoose', 'twoDice': 'twoDice' };

	//Al entrar en la calculadora se crea una nueva jugada
	var newPlay = new jugada();

	//Parte de la pantalla para gestionar la tirada
	var tiradaDiv = document.getElementById("tiradaValues");

	//Parte de la pantalla para gestionar el resultado
	var resultDiv = document.getElementById("porcentaje");

	//Switcher de rerolls
	var reroller = document.getElementById("RR");

	//Botón de reinicio
	var restarter = document.getElementById("restart");
  
	//Objeto modal para gestionar la ventana modal
	const myModal = bootstrap.Modal.getOrCreateInstance("#tiradaModal");
  
	//Objeto DOM de la ventana modal
	var ventanaModal = document.getElementById("tiradaModal");
	
	//Objeto que almacena el botón repetible de la ventana modal
	var repetibleButton = document.getElementById("repetible");
  
	//Objeto que almacena el contenedor del botón enlazable de la ventana modal
	var enlazadaContainer = document.getElementById("enlazadaContainer");
  
	//Objeto que almacena el contenedor de botones para enlazar tiradas
	var enlazablesContainer = document.getElementById("enlazablesContainer");
	
	//Listener para controlar el cierre de la ventana modal
	ventanaModal.addEventListener("hide.bs.modal", function() {
		//Comprobaciones a realizar durante el cierre de la ventana modal
		/*Debemos comprobar que la tirada actual, si está marcada como enlazable, está enlazada a algún valor
			de lo contrario habría que anular su enlace, para evitar que permanezca como enlazada sin una tirada
			relacionada*/
		var numberRoll = ventanaModal.getAttribute("currentTirada");
		var theRoll = newPlay.tiradas[numberRoll];
		if (theRoll.linked && !isLinked(theRoll))
			theRoll.linked = false;
	});
  
	//Listener para gestionar la activación/desactivación de la reroll
	reroller.addEventListener("click", function() {
		var etiqueta = document.getElementById("etiqueta");
		//Se activa o desactiva la posibilidad de usar reroll para la tirada
		if (this.checked) {
			etiqueta.innerHTML = 'HAY REROLL';
			newPlay.isRRAvailable = true;
			newPlay.chanceRR = 100;
		} else {
			etiqueta.innerHTML = 'SIN REROLL';
			newPlay.isRRAvailable = false;
			newPlay.chanceRR = 0;
		}

		//Y se recalcula la jugada
		newPlay.calcular(resultDiv);
	});

	//Listener para gestionar el botón de reinicio
	restarter.addEventListener("click", function() {
		//Se deschequea la reroll si estaba marcada
		if (reroller.checked)
			reroller.click();

		//Se borra el contenido de la tirada a calcular
		tiradaDiv.innerHTML = '';

		//Se devuelve el porcentaje al 100%
		resultDiv.innerHTML = '100 %';

		//Se reinicia el objeto tirada
		newPlay.restart();
	});
	
	//Sencilla función que devuelve true si una tirada tiene un enlace activo
	function isLinked(theRoll) {
		return theRoll.orderLink != '' && theRoll.orderLink != null && theRoll.orderLink != undefined;
	}

	//Función que gestiona las acciones sobre una tirada activa
	function activeRollListener (that) {
		//Obtener el objeto botón de borrado
		var deleteButton = document.getElementById("deleteButton");
		//Identificar el número de tirada y trasladarlo a la ventana modal.
		var currentTiradaId = that.getAttribute("id").split('_')[1];
		ventanaModal.setAttribute("currentTirada", currentTiradaId);
		checkRepetible();
		
		//Se vacía el listener del evento click del botón repetible y se reasigna
		repetibleButton.removeEventListener("click", clickRepetible);
		repetibleButton.addEventListener("click", clickRepetible);
	
		//También se vacía el listener del evento click del botón de borrado y se reasigna
		deleteButton.removeEventListener("click", deleteRoll);
		deleteButton.addEventListener("click", deleteRoll);
	};
  
	//Función que gestiona la eliminación de una tirada
	function deleteRoll(ev) {
		//Identificar la tirada
		var numberRoll = ventanaModal.getAttribute("currentTirada");
		//Si la tirada estaba enlazada, hay que eliminar el enlace
		var tirada = newPlay.tiradas[numberRoll];
		if (tirada.linked)
			eraseLink(tirada);
		//Eliminar la tirada del array
		newPlay.tiradas.splice(numberRoll, 1);
		document.getElementById('tirada_' + numberRoll).remove();
		newPlay.calcular(resultDiv);
		myModal.hide();
	}
  
	//Función que chequea el estado del botón repetible y aplica el resultado a la ventana modal
	function checkRepetible() {
		var numberRoll = ventanaModal.getAttribute("currentTirada");
		var etiqueta = document.getElementById("etiquetaRepetible");
		var theRoll = newPlay.tiradas[numberRoll];
		if (theRoll.repetible) {
			repetibleButton.checked = true;
			etiqueta.innerHTML = 'La tirada es repetible';
			enlazadaContainer.style.visibility = 'visible';
			checkEnlazable();
		} else {
			repetibleButton.checked = false;
			etiqueta.innerHTML = 'La tirada no es repetible';
			enlazadaContainer.style.visibility = 'hidden';
			enlazablesContainer.style.visibility = 'hidden';
		}
	}
  
	//Función que chequea el estado del botón enlazable y aplica el resultado a la ventana modal
	function checkEnlazable() {
		var numberRoll = ventanaModal.getAttribute("currentTirada");
		var enlazableButton = document.getElementById("enlazada");
		var etiqueta = document.getElementById("etiquetaEnlazada");
		var theRoll = newPlay.tiradas[numberRoll];
		enlazableButton.removeEventListener('click', clickEnlazar);
		enlazableButton.addEventListener('click', clickEnlazar);
		if (theRoll.linked) {
			enlazableButton.checked = true;
			etiqueta.innerHTML = (theRoll.orderLink == '') ? 'Selecciona una tirada a la que enlazarla' 
				: 'La tirada se enlaza con el resto de tiradas con borde rojo';
			enlazablesContainer.innerHTML = '';
			checkTiradasEnlazables();
			enlazablesContainer.style.visibility = 'visible';
		} else {
			enlazableButton.checked = false;
			etiqueta.innerHTML = 'La tirada no está enlazada';
			enlazablesContainer.style.visibility = 'hidden';
		}
	}
  
	//Función que chequea el estado del contenedor de tiradas enlazables y los colores en que debe verse cada tirada
	function checkTiradasEnlazables() {
		var numberRoll = ventanaModal.getAttribute("currentTirada");
		enlazablesContainer.innerHTML = '';
		var colorClass;
		var theRoll = newPlay.tiradas[numberRoll];
		for (roll in newPlay.tiradas) {
			var thisRoll = newPlay.tiradas[roll];
			var nuevaTirada = document.createElement('div');
			colorClass = '';
			nuevaTirada.id = 'tirada_' + roll;
			nuevaTirada.className = 'diceRoll text-center activeRoll';
			if (thisRoll == theRoll || (isLinked(theRoll) && thisRoll.orderLink == theRoll.orderLink)) {
					colorClass = "reddish";
			} else {
				if (thisRoll.repetible)
					colorClass = "bluish linkable";
			}
			
			nuevaTirada.innerHTML = '<img id="dadoTirada_' + roll + '" src="img/'
				+ diceSides[newPlay.tiradas[roll].image] + '.png" class="diceImage mx-auto '
				+ colorClass + '" />';
			
			enlazablesContainer.appendChild(nuevaTirada);
			if (colorClass.indexOf('linkable') != -1)
				nuevaTirada.addEventListener("click", enlazarTiradas);
		}
	}

	//Función que gestiona la activación de una tirada como repetible
	function clickRepetible(ev) {
		var object = ev.currentTarget;
		var numberRoll = ventanaModal.getAttribute("currentTirada");
		var theRoll = newPlay.tiradas[numberRoll];
		//Marcarla como repetible o devolverla a estado no repetible
		if (theRoll.repetible) {
			theRoll.repetible = false;
      
			//Si la tirada estaba marcada como repetible y enlazada, hay que desenlazarla
			if (theRoll.linked) 
				eraseLink(theRoll);
		} else 
			theRoll.repetible = true;

		newPlay.calcular(resultDiv);
		checkRepetible();
	}
  
	//Función que gestiona el click sobre el checkbox de enlazado de tiradas
	function clickEnlazar(ev) {
		var object = ev.currentTarget;
		var numberRoll = ventanaModal.getAttribute("currentTirada");
		var theRoll = newPlay.tiradas[numberRoll];
		//Marcar la tirada como enlazada o devolverla a estado no enlazada
		if (theRoll.linked) {
			theRoll.linked = false;
			eraseLink(theRoll);
		} else 
			theRoll.linked = true;
	  
		newPlay.calcular(resultDiv);
		checkEnlazable();
	}
  
	/*Función que gestiona la eliminación del enlace en una tirada, para ello:
		1) Elimina el flag enlazada y el orden de enlace al que pertenecía.
		2) Comprueba si, al eliminar el enlace, quedan más tiradas con ese enlace
			Si sólo queda una tirada con ese enlace, tambien se elimina el enlace de esa tirada.
			Si se encuentran al menos dos tiradas con el enlace se retorna, ya que no hace falta hacer nada más.
	*/
	function eraseLink(theRoll) {
		theRoll.linked = false;
		var orden = theRoll.orderLink;
		theRoll.orderLink = null;
	  
		var anotherOneFound = false;
		var linkedRoll = null;
		for(roll in newPlay.tiradas) {
			var currentRoll = newPlay.tiradas[roll];
			if (currentRoll == theRoll)
				continue;
			if (currentRoll.orderLink == orden) {
				if (anotherOneFound)
					return;
				else {
					anotherOneFound = true;
					linkedRoll = currentRoll;
				}
			}
		}
		if (anotherOneFound) {
			/*Si hemos recorrido todo el array y la función no ha retornado es que sólo hemos encontrado otra tirada enlazada
				hay que anular el enlace de esa tirada */
			linkedRoll.linked = false;
			linkedRoll.orderLink = null;
		}
	}
  
	//Función enlazarTiradas: identifica el número de tirada sobre la que se hace click y la tirada en juego
	//  en la ventana modal, enlaza ambas tiradas y recarga el espacio de tiradas para identificar por colores
	//  las tiradas que están enlazadas.
	function enlazarTiradas(ev) {
		var currentRoll = newPlay.tiradas[ventanaModal.getAttribute("currentTirada")];
		var selectedRoll = newPlay.tiradas[ev.currentTarget.getAttribute("id").split('_')[1]];
	  
		//Si se ha seleccionado una tirada que ya está enlazada a otras, simplemente se añade la tirada en curso al enlace
		if (selectedRoll.linked) {
			currentRoll.linked = true;
			currentRoll.orderLink = selectedRoll.orderLink;
		} else {
			//Si no, se están enlazando dos tiradas por primera vez juntas
			currentRoll.linked = true;
			selectedRoll.linked = true;
			newPlay.linkedRolls++;
			currentRoll.orderLink = newPlay.linkedRolls;
			selectedRoll.orderLink = newPlay.linkedRolls;
		}
		newPlay.calcular(resultDiv);
		checkTiradasEnlazables();
	}

	//Listener que gestiona el click sobre una posible tirada
	document.querySelectorAll(".diceRoll").forEach(i => i.addEventListener("click", function() {
		//Al pulsar un botón de un dado se crea una nueva tirada de un dado
		var newRoll = new tirada();
		var index = newPlay.tiradas.length;
		newRoll.tipo = this.attributes["type"].value;
		newRoll.valor = this.attributes["value"].value;
		newRoll.image = newRoll.valor;
		if (newRoll.tipo == 'block') {  
			newRoll.numDice = this.attributes["numDice"].value;
			newRoll.typeBlock = this.attributes["typeBlock"].value;
			newRoll.image = newRoll.tipo + newRoll.numDice + newRoll.typeBlock;
			while (isNaN(newRoll.valor) || newRoll.valor > 6 || newRoll.valor < 1)
				newRoll.valor = parseInt(prompt('Cuántas caras del dado te sirven?'));
		}
		if (newRoll.tipo == 'twoDice') { 
			newRoll.image = 'twoDice';
			while (isNaN(newRoll.valor) || newRoll.valor > 12 || newRoll.valor < 2)
				newRoll.valor = parseInt(prompt('Cuál es la tirada a conseguir?'));
		}

		//Se añade la nueva tirada a la jugada
		newPlay.tiradas[index] = newRoll;
		var nuevaTirada = document.createElement('div');
		nuevaTirada.id = 'tirada_' + index;
		nuevaTirada.className = 'diceRoll text-center activeRoll';
		nuevaTirada.innerHTML = '<img id="dadoTirada_' + index + '" src="assets/img/'
			+ diceSides[newRoll.image] + '.png" class="diceImage mx-auto" data-bs-toggle="modal" '
			+ 'data-bs-target="#tiradaModal"/>';

		tiradaDiv.appendChild(nuevaTirada);
		nuevaTirada.addEventListener("click", function() { activeRollListener(this) });
    
		//Se computa el nuevo resultado y se saca por pantalla
		newPlay.calcular(resultDiv);
	}));
};