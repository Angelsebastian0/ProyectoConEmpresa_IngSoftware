<?php
session_start();
include("db.php");

if ($_SERVER["REQUEST_METHOD"] == "POST") {
	$correo = $_POST["correo"];
	$clave = $_POST["clave"];

	$correo = mysqli_real_escape_string($conn, $correo);
	$clave = mysqli_real_escape_string($conn, $clave);

	$query = "SELECT * FROM usuarios WHERE correo='$correo' ";
	$result = mysqli_query($conn, $query);
	$user = mysqli_fetch_assoc($result);
	
	if ($user && password_verify($clave, $user["clave"])) {
		$_SESSION["nombre"] = $user["nombre"];
		header("Location: catalogo.html");
		exit();
		} else {
		  $error = "Correo o contraseña incorrectos.";
		}
}
?>


<!DOCTYPE html>
<html lang="es">
<head>
   <meta charset="UTF-8">
   <title>Iniciar sesion</title>
   <link rel="stylesheet" href="diseñoLogin.css">
</head>
<body>
   <div class="container">
     <h1>Iniciar sesion</h1>
     <?php if (isset($error)) echo "<p style='color: red;'>$error</p>"; ?>
     <form method="POST" class="form">
       <input type="email" name="correo" placeholder="Correo electrónico" required>
       <input type="password" name="clave" placeholder="Contraseña" required>
       <button type="submit" class="btn">Entrar</button>
     </form>
     <p>¿No tienes una cuenta? <a href="register.php">Registrate aqui</a></p>
   </div>
</body>
</html>