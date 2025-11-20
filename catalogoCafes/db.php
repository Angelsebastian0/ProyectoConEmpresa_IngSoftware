<?php
$host = "localhost";
$usuario = "root";
$clave = "";
$bd = "base_datos_proyecto";

$conn = new mysqli($host, $usuario, $clave, $bd);

if ($conn->connect_error) {
	die("Error de conexion: " . $conn->connect_error);
}
?>