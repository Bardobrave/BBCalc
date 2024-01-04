# BBCalc
Calculadora de jugadas para Blood Bowl

# Funcionamiento de la calculadora
Hay tres hileras de imágenes con los posibles tipos de tiradas a incluir en tu cálculo: valores numéricos a obtener en una tirada (de 2+ a 6+), tiradas de dados de placaje (de 3 calaveras, que serían 3 dados eligiendo tu rival, a 3 estallidos, que serían 3 dados eligiendo tú) y tiradas de dos dados de 6.

Cada vez que se hace click en uno de los iconos se incorpora la posibilidad de esa tirada al cálculo completo de la jugada y se recalcula la probabilidad global de éxito. Si estás escogiendo un tipo de tirada de dados de placaje la aplicación te preguntará cuántas caras de los dados te sirven para considerar la tirada exitosa (si sólo me sirven estallidos escribiré 1, si me sirven estallidos y placajes escribiré 2, y así...), y si estás escogiendo una tirada de dos dados, la aplicación te preguntará por el valor a obtener en ambos dados (así, si necesito una tirada de 8+ para romper una armadura, por ejemplo, escribiré 8).

Si dispongo de reroll para la jugada lo puedo seleccionar en el selector específico de reroll, el valor se recalcula sobre la marcha al cambiar la selección.

# Gestionar tiradas dentro de una jugada: Borrar tiradas, marcarlas como repetibles y enlazarlas
Conforme se van añadiendo tiradas de dados a la jugada, se van visualizando en la parte inferior de la pantalla, en esa sección se puede hacer click sobre los dados para abrir una ventana que me permite modificar esa tirada en particular, en esa ventana podemos borrar la tirada de nuestra jugada pulsando el botón borrar.

Cuando tengamos que identificar que una tirada es repetible (porque disponemos de una habilidad que nos permite repetirla sin recurrir a reroll) podemos marcarlo en la ventana en cuestión, al marcar o desmarcar la repetibilidad de una tirada se recalculan los porcentajes sobre la marcha.

Si dos tiradas son repetibles pero están vinculadas, por ejemplo, dos tiradas de esquivar en la misma jugada en las que tenemos la habilidad de esquivar, pueden vincularse ambas tiradas desde la ventana de edición de cada tirada, marcando primero que son ambas repetibles, y seleccionando después aquellas tiradas que son repetibles. Cuando se están vinculando tiradas, la tirada en curso, y aquellas a las que se vincula, aparecen con borde rojo, otras tiradas repetibles, pero a las que no está vinculada la tirada en curso, aparecen con borde azul. Cada operación de vinculación/desvinculación hace que la probabilidad de las tiradas se recalculen sobre la marcha. Cuando hay reroll y varias tiradas vinculadas repetibles el sistema tiene en cuenta la probabilidad de gastar la repetición en cada tirada y poder tener que utilizar la reroll en las siguientes.
