-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost
-- Tiempo de generación: 02-03-2026 a las 01:56:44
-- Versión del servidor: 10.4.28-MariaDB
-- Versión de PHP: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `fix_care`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `areas`
--

CREATE TABLE `areas` (
  `id` int(10) NOT NULL,
  `id_edificio` int(10) NOT NULL,
  `nombre` varchar(250) NOT NULL,
  `plnata` int(10) NOT NULL,
  `polygono` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`polygono`)),
  `tipo` varchar(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `edificios`
--

CREATE TABLE `edificios` (
  `id` int(10) NOT NULL,
  `id_org` int(10) NOT NULL,
  `nombre` varchar(200) NOT NULL,
  `polygono` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`polygono`)),
  `planta` int(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `organizaciones`
--

CREATE TABLE `organizaciones` (
  `id` int(10) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `poligono` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`poligono`)),
  `logo` varchar(255) DEFAULT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `organizaciones`
--

INSERT INTO `organizaciones` (`id`, `nombre`, `poligono`, `logo`, `fecha_registro`) VALUES
(4, 'Tech Solutions S.A.', '', 'logo_tech.png', '2026-02-28 23:09:07'),
(5, 'Hospital General', '', 'logo_hosp.png', '2026-02-28 23:09:07'),
(6, 'Juan Pérez Freelance', '[{\"lat\":19.72267076220459,\"lng\":-101.16331100463869},{\"lat\":19.724204851004277,\"lng\":-101.16331100463869},{\"lat\":19.724204851004277,\"lng\":-101.1600172519684},{\"lat\":19.72267076220459,\"lng\":-101.1600172519684}]', 'logo_1772344595_69a3d5135edcc.png', '2026-03-01 05:56:35'),
(7, 'UTM', '[{\"lat\":19.727579381268562,\"lng\":-101.16369724273683},{\"lat\":19.730104146591508,\"lng\":-101.15790367126466},{\"lat\":19.72941741437394,\"lng\":-101.15786075592042},{\"lat\":19.728791273602877,\"lng\":-101.15824699401857},{\"lat\":19.72808433752497,\"lng\":-101.15859031677248},{\"lat\":19.72685224145574,\"lng\":-101.16004943847656},{\"lat\":19.726145296798645,\"lng\":-101.16120815277101},{\"lat\":19.725660532940367,\"lng\":-101.16273164749147},{\"lat\":19.725478746114366,\"lng\":-101.16384744644166},{\"lat\":19.72610489986661,\"lng\":-101.16457700729372},{\"lat\":19.72699363001184,\"lng\":-101.16438388824464}]', 'logo_1772321419_69a37a8bdbbe1.png', '2026-03-01 06:01:08'),
(8, 'Gobierno', '[{\"lat\":19.701363036348834,\"lng\":-101.1895537376404},{\"lat\":19.702034291446832,\"lng\":-101.1895537376404},{\"lat\":19.702034291446832,\"lng\":-101.18892073631288},{\"lat\":19.701363036348834,\"lng\":-101.18892073631288}]', 'logo_1772343792_69a3d1f0d2298.png', '2026-03-01 05:48:14');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `relacion_encargado`
--

CREATE TABLE `relacion_encargado` (
  `id` int(10) NOT NULL,
  `id_admin` int(10) NOT NULL,
  `id_organizacion` int(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `relacion_encargado`
--

INSERT INTO `relacion_encargado` (`id`, `id_admin`, `id_organizacion`) VALUES
(1, 20, 7),
(2, 20, 7);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `seguimiento`
--

CREATE TABLE `seguimiento` (
  `id` int(10) NOT NULL,
  `idTecnico` int(10) NOT NULL,
  `idTicket` int(10) NOT NULL,
  `bitacora` text NOT NULL,
  `fecha` datetime NOT NULL,
  `img` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `seguimiento`
--

INSERT INTO `seguimiento` (`id`, `idTecnico`, `idTicket`, `bitacora`, `fecha`, `img`) VALUES
(3, 21, 51, 'Se revisó el tablero principal y se detectó un interruptor termomagnético dañado. Se procedió al cambio.', '2026-02-25 20:25:24', '');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `servicios`
--

CREATE TABLE `servicios` (
  `idServicios` int(10) NOT NULL,
  `nombre` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `servicios`
--

INSERT INTO `servicios` (`idServicios`, `nombre`) VALUES
(1, 'Plomeria'),
(2, 'Electricidad'),
(3, 'Limpieza/Sanitizaci?n'),
(4, 'Soporte T?cnico'),
(5, 'Infraestructura'),
(6, 'Seguridad'),
(7, 'Mant. General');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tecnico_organizaciones`
--

CREATE TABLE `tecnico_organizaciones` (
  `id` int(10) NOT NULL,
  `id_tecnico` int(10) NOT NULL,
  `id_organizaciones` int(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tecnico_organizaciones`
--

INSERT INTO `tecnico_organizaciones` (`id`, `id_tecnico`, `id_organizaciones`) VALUES
(3, 21, 7),
(4, 21, 7);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ticket`
--

CREATE TABLE `ticket` (
  `idTicket` int(10) NOT NULL,
  `idUsuario` int(10) NOT NULL,
  `fecha` date NOT NULL,
  `idServicio` int(10) NOT NULL,
  `area` varchar(250) NOT NULL,
  `problematica` text NOT NULL,
  `estado` varchar(50) NOT NULL,
  `img` varchar(250) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ticket`
--

INSERT INTO `ticket` (`idTicket`, `idUsuario`, `fecha`, `idServicio`, `area`, `problematica`, `estado`, `img`) VALUES
(51, 22, '2026-02-25', 2, 'Oficinas Planta Alta', 'No hay luz en los contactos del pasillo principal.', 'Abierto', 'falla_electrica.jpg');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `id` int(10) NOT NULL,
  `rol` varchar(50) NOT NULL,
  `menu` text NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `apepat` varchar(50) NOT NULL,
  `apemat` varchar(80) NOT NULL,
  `correo` varchar(200) NOT NULL,
  `cel` varchar(80) NOT NULL,
  `user` varchar(20) NOT NULL,
  `password` text NOT NULL,
  `img` varchar(250) NOT NULL,
  `usuario_creado` datetime NOT NULL,
  `usuario_actualizado` datetime NOT NULL,
  `id_organizacion` int(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id`, `rol`, `menu`, `nombre`, `apepat`, `apemat`, `correo`, `cel`, `user`, `password`, `img`, `usuario_creado`, `usuario_actualizado`, `id_organizacion`) VALUES
(20, 'admin', '[\n  {\n    \"nombre\": \"Dashboard\",\n    \"ruta\": \"dashboard\",\n    \"icono\": \"bi bi-tv\",\n    \"orden\": 1\n  },\n  {\n    \"nombre\": \"Nuevo Usuario\",\n    \"ruta\": \"userNew\",\n    \"icono\": \"bi bi-file-person-fill\",\n    \"orden\": 2\n  },\n  {\n    \"nombre\": \"Lista de Usuarios\",\n    \"ruta\": \"organizacion\",\n    \"icono\": \"bi bi-info-circle-fill\",\n    \"orden\": 3\n  },\n  {\n    \"nombre\": \"Editar Usuario\",\n    \"ruta\": \"tickets\",\n    \"icono\": \"bi bi-input-cursor-text\",\n    \"orden\": 4\n  },\n  {\n    \"nombre\": \"Buscar Usuario\",\n    \"ruta\": \"userSearch\",\n    \"icono\": \"bi bi-search\",\n    \"orden\": 5\n  },\n  {\n    \"nombre\": \"Foto de Perfil\",\n    \"ruta\": \"userPhoto\",\n    \"icono\": \"bi bi-image\",\n    \"orden\": 6\n  },\n  {\n    \"nombre\": \"Cerrar Sesión\",\n    \"ruta\": \"logOut\",\n    \"icono\": \"bi bi-box-arrow-right\",\n    \"orden\": 7\n  }\n]', 'Carlos', 'Gomez', 'Lopez', 'carlos@empresa.com', '5551234567', 'Andy', '$2y$10$pKNeu7BdbZ0Zqqyj1tZshONEkukrnweqENLJD6aTl1bdUsyd0Ton6', 'carlos.png', '2026-02-25 13:14:08', '2026-02-25 13:14:08', 7),
(21, 'tecnico', '[]', 'Roberto', 'Sánchez', 'Mota', 'roberto@fixcare.com', '5559876543', 'rober_tec', 'tec456', 'rober.png', '2026-02-25 13:14:08', '2026-02-25 13:14:08', 7),
(22, 'usuario', '[]', 'Laura', 'Torres', 'Ríos', 'laura@cliente.com', '5550001122', 'laura_t', 'client789', 'laura.png', '2026-02-25 13:14:08', '2026-02-25 13:14:08', 7);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `areas`
--
ALTER TABLE `areas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_edificio` (`id_edificio`);

--
-- Indices de la tabla `edificios`
--
ALTER TABLE `edificios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_org` (`id_org`);

--
-- Indices de la tabla `organizaciones`
--
ALTER TABLE `organizaciones`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `relacion_encargado`
--
ALTER TABLE `relacion_encargado`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `seguimiento`
--
ALTER TABLE `seguimiento`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idTecnico` (`idTecnico`),
  ADD KEY `idTicket` (`idTicket`);

--
-- Indices de la tabla `servicios`
--
ALTER TABLE `servicios`
  ADD PRIMARY KEY (`idServicios`);

--
-- Indices de la tabla `tecnico_organizaciones`
--
ALTER TABLE `tecnico_organizaciones`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `ticket`
--
ALTER TABLE `ticket`
  ADD PRIMARY KEY (`idTicket`),
  ADD UNIQUE KEY `ticket_seguimiento` (`idServicio`),
  ADD KEY `ticket_ibfk_1` (`idUsuario`),
  ADD KEY `ticket_ibfk_3` (`idServicio`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_organizacion` (`id_organizacion`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `areas`
--
ALTER TABLE `areas`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `edificios`
--
ALTER TABLE `edificios`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `organizaciones`
--
ALTER TABLE `organizaciones`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `relacion_encargado`
--
ALTER TABLE `relacion_encargado`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `seguimiento`
--
ALTER TABLE `seguimiento`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `servicios`
--
ALTER TABLE `servicios`
  MODIFY `idServicios` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `tecnico_organizaciones`
--
ALTER TABLE `tecnico_organizaciones`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `ticket`
--
ALTER TABLE `ticket`
  MODIFY `idTicket` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `areas`
--
ALTER TABLE `areas`
  ADD CONSTRAINT `areas_ibfk_1` FOREIGN KEY (`id_edificio`) REFERENCES `edificios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `edificios`
--
ALTER TABLE `edificios`
  ADD CONSTRAINT `edificios_ibfk_1` FOREIGN KEY (`id_org`) REFERENCES `organizaciones` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `relacion_encargado`
--
ALTER TABLE `relacion_encargado`
  ADD CONSTRAINT `relacion_encargado_ibfk_1` FOREIGN KEY (`id_organizacion`) REFERENCES `organizaciones` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `relacion_encargado_ibfk_2` FOREIGN KEY (`id_admin`) REFERENCES `usuario` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `seguimiento`
--
ALTER TABLE `seguimiento`
  ADD CONSTRAINT `seguimiento_ibfk_2` FOREIGN KEY (`idTecnico`) REFERENCES `usuario` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `seguimiento_ibfk_3` FOREIGN KEY (`idTicket`) REFERENCES `ticket` (`idTicket`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `tecnico_organizaciones`
--
ALTER TABLE `tecnico_organizaciones`
  ADD CONSTRAINT `tecnico_organizaciones_ibfk_1` FOREIGN KEY (`id_tecnico`) REFERENCES `usuario` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `tecnico_organizaciones_ibfk_2` FOREIGN KEY (`id_organizaciones`) REFERENCES `organizaciones` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `ticket`
--
ALTER TABLE `ticket`
  ADD CONSTRAINT `ticket_ibfk_1` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ticket_ibfk_3` FOREIGN KEY (`idServicio`) REFERENCES `servicios` (`idServicios`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
