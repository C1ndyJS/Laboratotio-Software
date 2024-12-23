import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Box,
  Snackbar,
  TextField,
  InputAdornment,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import {
  Cancel,
  FlightTakeoff,
  Schedule,
  Person,
  Search,
  Info,
  Warning,
  EventBusy,
} from "@mui/icons-material";
import NavbarAdmin from "./NavbarAdmin"; // Asegúrate de que la ruta sea correcta
import Footer from "./Footer"; // Asegúrate de que la ruta sea correcta

export default function CancelacionVuelosMejorada() {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [vuelos, setVuelos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token"); // Supongamos que guardas el token en localStorage
  
    axios
      .get("http://localhost:5009/obtenervuelos", {
        headers: {
          Authorization: `Bearer ${token}`, // Enviar el token como Bearer
        },
      })
      .then((response) => {
        if (response.data && Array.isArray(response.data)) {
          setVuelos(response.data);
        } else {
          console.error("La respuesta no es válida:", response.data);
        }
      })
      .catch((error) => {
        console.error("Error al obtener los vuelos:", error);
        alert("Hubo un problema al cargar los vuelos. Intenta nuevamente.");
      });
  }, []);
  

  const handleOpenDialog = (vuelo) => {
    setSelectedFlight(vuelo);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedFlight(null);
  };

  const handleCancelFlight = async () => {
    try {
      // Asegúrate de tener el `CodigoVuelo` del vuelo seleccionado
      const { VueloID } = selectedFlight;
      console.log("datosdel front: ",VueloID)
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token no encontrado");
  
      // Solicitud DELETE al backend
      await axios.delete(`http://localhost:5009/CancelarVuelos/${VueloID}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      // Actualiza la lista de vuelos en el estado local
      setVuelos(vuelos.filter((v) => v.VueloID !== VueloID));
      handleCloseDialog();
      setOpenSnackbar(true);
  
      console.log(`Vuelo con ID ${VueloID} cancelado exitosamente.`);
    } catch (error) {
      console.error("Error al cancelar el vuelo:", error);
    }
  };
  

  const getChipColor = (estado) => {
    switch (estado) {
      case "Programado":
        return "success";
      case "En Espera":
        return "warning";
      case "Embarcando":
        return "info";
      default:
        return "default";
    }
  };

  const filteredVuelos = vuelos.filter(
    (vuelo) =>
      vuelo.CodigoVuelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vuelo.Origen.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vuelo.Destino.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box
      display="flex"
      flexDirection="column"
      minHeight="100vh" // Hace que el contenedor ocupe toda la pantalla
    >
      <NavbarAdmin /> {/* Navbar fijo en la parte superior */}
      <Box
        component="main"
        flex="1" // Hace que el contenido ocupe el espacio restante
        sx={{ py: 4 }}
      >
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Paper elevation={3} sx={{ p: 3, mb: 4, backgroundColor: "#f8f9fa" }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
              Panel de Cancelación de Vuelos
            </Typography>

            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card raised>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Total de Vuelos
                    </Typography>
                    <Typography variant="h4">{vuelos.length}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card raised>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Pasajeros Afectados
                    </Typography>
                    <Typography variant="h4">
                      {vuelos.reduce(
                        (total, vuelo) => total + vuelo.Pasajeros,
                        0
                      )}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card raised>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Vuelos En Espera
                    </Typography>
                    <Typography variant="h4">
                      {
                        vuelos.filter((vuelo) => vuelo.Estado === "En Espera")
                          .length
                      }
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card raised>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Vuelos Embarcando
                    </Typography>
                    <Typography variant="h4">
                      {
                        vuelos.filter((vuelo) => vuelo.Estado === "Embarcando")
                          .length
                      }
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <TextField
              fullWidth
              variant="outlined"
              placeholder="Buscar por número de vuelo, origen o destino"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <Grid container spacing={3}>
              {filteredVuelos.map((vuelo) => (
                <Grid item xs={12} sm={6} md={4} key={vuelo.VueloID}>
                  <Card
                    raised
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 2,
                        }}
                      >
                        <Typography variant="h6" component="div">
                          {vuelo.CodigoVuelo}
                        </Typography>
                        <Chip
                          label={vuelo.Estado}
                          color={getChipColor(vuelo.Estado)}
                          size="small"
                        />
                      </Box>
                      <Typography color="text.secondary" gutterBottom>
                        <FlightTakeoff
                          sx={{ verticalAlign: "bottom", mr: 1 }}
                        />
                        {vuelo.Origen} - {vuelo.Destino}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <Schedule sx={{ verticalAlign: "bottom", mr: 1 }} />
                        {vuelo.FechaVuelo} {vuelo.HoraSalida}
                      </Typography>
                      <Typography variant="body2">
                        <Person sx={{ verticalAlign: "bottom", mr: 1 }} />
                        {vuelo.Pasajeros} pasajeros
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<Cancel />}
                        onClick={() => handleOpenDialog(vuelo)}
                        fullWidth
                      >
                        Cancelar Vuelo
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Información adicional sobre la cancelación */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Información Importante
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Info color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="La cancelación de un vuelo es irreversible." />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Warning color="error" />
                    </ListItemIcon>
                    <ListItemText primary="Asegúrese de notificar a todos los pasajeros afectados." />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <EventBusy color="secondary" />
                    </ListItemIcon>
                    <ListItemText primary="Considere las implicaciones en vuelos Cancelados." />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Procedimiento de Cancelación
                </Typography>
                <ol>
                  <li>Verificar la información del vuelo</li>
                  <li>Confirmar la necesidad de cancelación</li>
                  <li>Notificar al equipo de operaciones</li>
                  <li>Iniciar el proceso de reembolso para los pasajeros</li>
                  <li>Actualizar el estado del vuelo en el sistema</li>
                </ol>
              </Paper>
            </Grid>
          </Grid>

          {/* Confirmación de cancelación */}
          <Dialog open={openDialog} onClose={handleCloseDialog}>
            <DialogTitle>
              {"¿Está seguro que desea cancelar este vuelo?"}
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Esta acción no se puede deshacer. Se cancelará el siguiente
                vuelo:
              </Typography>
              {selectedFlight && (
                <Box
                  sx={{
                    backgroundColor: "background.paper",
                    p: 2,
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="h6">
                    {selectedFlight.CodigoVuelo}
                  </Typography>
                  <Typography>
                    {selectedFlight.Origen} - {selectedFlight.Destino}
                  </Typography>
                  <Typography>
                    {selectedFlight.FechaVuelo} {selectedFlight.HoraSalida}
                  </Typography>
                  <Typography>{selectedFlight.Pasajeros} pasajeros</Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} color="primary">
                Cancelar
              </Button>
              <Button
                onClick={handleCancelFlight}
                color="error"
                variant="contained"
                autoFocus
              >
                Sí, Cancelar Vuelo
              </Button>
            </DialogActions>
          </Dialog>

          {/* Snackbar para notificación de éxito */}
          <Snackbar
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            open={openSnackbar}
            autoHideDuration={6000}
            onClose={() => setOpenSnackbar(false)}
            message="Vuelo cancelado exitosamente"
            action={
              <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={() => setOpenSnackbar(false)}
              >
                <Cancel fontSize="small" />
              </IconButton>
            }
          />
        </Container>
      </Box>
      <Footer /> {/* Footer fijo en la parte inferior */}
    </Box>
  );
}
