/* Una jugada se define como una lista de tiradas */

//Función que redondea un número a dos decimales
function round(number) {
	return Math.round(number * 100) / 100;
}

//Objeto con los métodos que permiten el cálculo de posibilidades de cada tipo de tiradas.
const rollDiceChances = {
	'oneDice': function (tirada) {
		return round(((100 / 6) * (7 - tirada.valor)));
	},
	'block': function (tirada) {
		var oneDiceChance = round((100 / 6) * ((tirada.typeBlock == 'Dis') ? (6 - tirada.valor) 
			: tirada.valor));
		var accumulatedFail = 100;
		var accumulatedChance = 0;
		for (var rolls = 1; rolls <= tirada.numDice; rolls++) {
			accumulatedChance += round(oneDiceChance * (accumulatedFail / 100));
			accumulatedFail = 100 - accumulatedChance;
		}
		if (tirada.typeBlock == 'Dis')
			accumulatedChance = 100 - accumulatedChance;
		
		return accumulatedChance;
	},
	'twoDice': function (tirada) {
		//Array con el número de resultados válidos para cada valor de los dos dados
		var arrayResultadosViables = [0, 0, 1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1]
		var totalResultadosViables = 0;
		for (var i = tirada.valor; i <= 12; i++)
			totalResultadosViables += arrayResultadosViables[i];
		return round((totalResultadosViables * 100) / 36);
	}
}

function tirada() {
	this.tipo = '';
	this.repetible = false;
	this.linked = false;
	this.orderLink = '';
	this.chanceRepetible = 100;
	this.valor = 0;
	this.numDice = 1;
	this.typeBlock = '';
	this.calcularBase = function () {
		return rollDiceChances[this.tipo](this);
	}
}

function jugada() {
	this.restart = function () {
		this.tiradas = [];
		this.chance = 100;
		this.isRRAvailable = false;
		this.chanceRR = 0;
		this.linkedRolls = 0;
		this.linkingRolls = false;
	};
	this.calcular = function (container) {
		//Esta es la función que realiza el cálculo de probabilidad de la jugada
		//Al lanzar el cálculo hay que resetear el porcentaje inicial a 100%
		this.chance = 100;
		this.chanceRR = (this.isRRAvailable) ? 100 : 0;

		//Básicamente lo que va a hacer es recorrer cada tirada e ir calculando
		for(var rollCount in this.tiradas) {
			rollCount = parseInt(rollCount);
			//Para cada tirada
			var tirada = this.tiradas[rollCount];

			//Si la tirada no se ha eliminado
			if (tirada != '') {
				//Se calcula la probabilidad individual de éxito en la tirada en curso
				var individualSuccessChance = tirada.calcularBase();
				var individualFailureChance = 100 - individualSuccessChance;
				var accumulatedSuccessChance = individualSuccessChance;

				//Si la tirada es repetible
				if (tirada.repetible) {
					//Se calcula la posibilidad de éxito repitiendo la tirada
					var addSuccessChance = individualFailureChance * individualSuccessChance / 100;

					//Si la tirada está enlazada con otras
					if (tirada.linked) {
						/*Hay que reducir la posibilidad de éxito extra en la probabilidad
							remantente de repetición que quede*/
						addSuccessChance = addSuccessChance * tirada.chanceRepetible / 100;

						/*Y, salvo que sea la última tirada, buscar la siguiente tirada de
							la serie para reducir su probabilidad de repetición*/
						if (rollCount < this.tiradas.length - 1) {
							var found = false;
							for (var x = rollCount + 1; x < this.tiradas.length && !found; x++) {
								var nextRoll = this.tiradas[x];
								if (nextRoll.linked && nextRoll.orderLink == tirada.orderLink) {
									nextRoll.chanceRepetible = tirada.chanceRepetible - (tirada.chanceRepetible * individualFailureChance / 100);
									found = true;
								}
							}
						}
					}

					//Y se suma a la posibilidad de éxito individual el añadido repitiendo
					accumulatedSuccessChance += addSuccessChance;
				}

				//Si hay reroll activa y no es una tirada de dos dados
				if (this.isRRAvailable && tirada.tipo != 'twoDice') {
					//Se calcula la probabilidad añadida gastando reroll
					var addSuccessChance = individualFailureChance * individualSuccessChance / 100;
					//Si la tirada es repetible se contabiliza la posibilidad de haber gastado ya la repetición
					if (tirada.repetible) {
						//Se calcula la probabilidad de haber gastado ya la repetición
						var chanceRepetibleSpent = 100 - tirada.chanceRepetible;
						//--->console.log("chanceRepetibleSpent = " + chanceRepetibleSpent);
						//Se reduce ese valor en la probabilidad de haber gastado ya la reroll (y la posible repetición)
						addSuccessChance *= (this.chanceRR / 100) * (chanceRepetibleSpent / 100);
						//--->console.log("addSuccessChance = " + addSuccessChance);
						//Se incrementa la posibilidad de éxito individual

						//--->console.log("individualSuccessChance = " + individualSuccessChance);
						accumulatedSuccessChance += addSuccessChance;
						//--->console.log("individual + added success chance = " + individualSuccessChance);
						//Y se reduce la posibilidad de tener disponible la reroll
						this.chanceRR -= (this.chanceRR * individualFailureChance / 100) * (chanceRepetibleSpent / 100);
					} else {
						//Si no es repetible se trata de manera más simple
						//Se reduce el valor de repetición sólo en la probabilidad de haber gastado la reroll
						addSuccessChance *= (this.chanceRR / 100);
						accumulatedSuccessChance += addSuccessChance;
						//Y la posibilidad de haber gastado la reroll es proporcionalmente mayor
						this.chanceRR -= (this.chanceRR * individualFailureChance / 100);
					}
				}

				this.chance = round((this.chance / 100) * accumulatedSuccessChance);
			}
		}
		container.innerHTML =  this.chance + ' %';
	};
	this.restart();
}