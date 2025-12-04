import React, { useEffect, useState } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Box, Typography } from '@mui/material';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function Inicio() {
  const [activos, setActivos] = useState(0);
  const [llamada, setLlamada] = useState(0);
  const [total, setTotal] = useState(0);
  const [totalFiliales, setTotalFiliales] = useState(0);
  const [voluntariosPorFilial, setVoluntariosPorFilial] = useState([]);
  const [promedioEdad, setPromedioEdad] = useState(0);
  // NUEVO: Estados para género
  const [hombres, setHombres] = useState(0);
  const [mujeres, setMujeres] = useState(0);
  const [otros, setOtros] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:3001/api/voluntarios').then(res => res.json()),
      fetch('http://localhost:3001/api/filiales').then(res => res.json())
    ])
    .then(([voluntarios, filiales]) => {
      const nActivos = voluntarios.filter(v => v["Calidad de voluntario"] === 'Activo').length;
      const nLlamada = voluntarios.filter(v => v["Calidad de voluntario"] === 'Llamada').length;

      setActivos(nActivos);
      setLlamada(nLlamada);
      setTotal(voluntarios.length);
      setTotalFiliales(filiales.length);

      const generoCount = { 'M': 0, 'F': 0, 'Otro': 0 };
      voluntarios.forEach(v => {
        const genero = v['Género'] || v.Género;
        if (generoCount[genero] !== undefined) {
          generoCount[genero]++;
        } else {
          generoCount['Otro']++;
        }
      });
      setHombres(generoCount['M']);
      setMujeres(generoCount['F']);
      setOtros(generoCount['Otro']);

      const filialCount = {};
      voluntarios.forEach(v => {
        const filial = v.Filial || 'Sin filial';
        filialCount[filial] = (filialCount[filial] || 0) + 1;
      });

      const top10 = Object.entries(filialCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => ({ name, count }));

      setVoluntariosPorFilial(top10);

      const edades = voluntarios.filter(v => v.Edad).map(v => v.Edad);
      const promedio = edades.length > 0 
        ? Math.round(edades.reduce((a, b) => a + b, 0) / edades.length) 
        : 0;
      setPromedioEdad(promedio);
    })
    .catch(e => console.error('Error cargando datos:', e));
  }, []);

  const doughnutData = {
    labels: ['Activos', 'De Llamada'],
    datasets: [
      {
        data: [activos, llamada],
        backgroundColor: ['#38b000', '#f8c102'],
        borderWidth: 2,
        borderColor: '#fff'
      },
    ],
  };

  const generoData = {
    labels: ['Mujeres', 'Hombres', 'Otros'],
    datasets: [
      {
        data: [mujeres, hombres, otros],
        backgroundColor: ['#ff6b9d', '#4ecdc4', '#ffe66d'],
        borderWidth: 3,
        borderColor: '#fff'
      },
    ],
  };

  const barData = {
    labels: voluntariosPorFilial.map(f => f.name),
    datasets: [
      {
        label: 'Voluntarios',
        data: voluntariosPorFilial.map(f => f.count),
        backgroundColor: '#9c1821',
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    },
    plugins: {
      legend: {
        display: false
      }
    }
  };

  return (
    <Box sx={{ 
      p: { xs: 2, sm: 4 }, 
      maxWidth: 1400, 
      mx: 'auto' 
    }}>
      {/* Tarjetas de estadísticas */}
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(auto-fit, minmax(200px, 1fr))' },
        gap: { xs: 1.5, sm: 2 },
        mb: { xs: 4, sm: 5 }
      }}>
        <Box sx={{ 
          background: 'linear-gradient(135deg, #9c1821 0%, #c54646 100%)',
          color: '#fff',
          p: { xs: 2.5, sm: 3 },
          borderRadius: 2,
          boxShadow: '0 4px 12px rgba(156, 24, 33, 0.3)'
        }}>
          <Typography sx={{ fontSize: { xs: 12, sm: 14 }, opacity: 0.9, mb: 1 }}>Total Voluntarios</Typography>
          <Typography sx={{ fontSize: { xs: 28, sm: 36 }, fontWeight: 700 }}>{total}</Typography>
        </Box>

        <Box sx={{ 
          background: 'linear-gradient(135deg, #38b000 0%, #4caf50 100%)',
          color: '#fff',
          p: { xs: 2.5, sm: 3 },
          borderRadius: 2,
          boxShadow: '0 4px 12px rgba(56, 176, 0, 0.3)'
        }}>
          <Typography sx={{ fontSize: { xs: 12, sm: 14 }, opacity: 0.9, mb: 1 }}>Voluntarios Activos</Typography>
          <Typography sx={{ fontSize: { xs: 28, sm: 36 }, fontWeight: 700 }}>{activos}</Typography>
        </Box>

        <Box sx={{ 
          background: 'linear-gradient(135deg, #f8c102 0%, #ffc107 100%)',
          color: '#fff',
          p: { xs: 2.5, sm: 3 },
          borderRadius: 2,
          boxShadow: '0 4px 12px rgba(248, 193, 2, 0.3)'
        }}>
          <Typography sx={{ fontSize: { xs: 12, sm: 14 }, opacity: 0.9, mb: 1 }}>Voluntarios de Llamada</Typography>
          <Typography sx={{ fontSize: { xs: 28, sm: 36 }, fontWeight: 700 }}>{llamada}</Typography>
        </Box>

        <Box sx={{ 
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          color: '#fff',
          p: { xs: 2.5, sm: 3 },
          borderRadius: 2,
          boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
        }}>
          <Typography sx={{ fontSize: { xs: 12, sm: 14 }, opacity: 0.9, mb: 1 }}>Total Filiales</Typography>
          <Typography sx={{ fontSize: { xs: 28, sm: 36 }, fontWeight: 700 }}>{totalFiliales}</Typography>
        </Box>
      </Box>

      {/* Gráficos */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(auto-fit, minmax(320px, 1fr))' },
        gap: 3,
        mb: 5
      }}>
        <Box sx={{
          background: '#fff',
          p: 4,
          borderRadius: 3,
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
        }}>
          <Typography sx={{ color: '#9c1821', mb: 3, fontSize: { xs: '1rem', sm: '1.3rem' } }}>
            Distribución de Voluntarios
          </Typography>
          <Box sx={{ maxWidth: 280, height: 280, mx: 'auto' }}>
            <Doughnut data={doughnutData} />
          </Box>
          <Box sx={{ display: 'flex', gap: 3, mt: 3, fontSize: 16, fontWeight: 500, justifyContent: 'center', color: '#333', flexWrap: 'wrap' }}>
            <span>
              <Box component="span" sx={{ display: 'inline-block', width: 16, height: 10, background: '#38b000', borderRadius: 4, mr: 1, verticalAlign: 'middle' }} />
              Activos: {activos}
            </span>
            <span>
              <Box component="span" sx={{ display: 'inline-block', width: 16, height: 10, background: '#f8c102', borderRadius: 4, mr: 1, verticalAlign: 'middle' }} />
              Llamada: {llamada}
            </span>
          </Box>
        </Box>

        <Box sx={{
          background: '#fff',
          p: 4,
          borderRadius: 3,
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
        }}>
          <Typography sx={{ color: '#9c1821', mb: 3, fontSize: { xs: '1rem', sm: '1.3rem' } }}>
            Distribución por Género
          </Typography>
          <Box sx={{ maxWidth: 280, height: 280, mx: 'auto' }}>
            <Doughnut data={generoData} />
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mt: 3, fontSize: 16, fontWeight: 500, justifyContent: 'center', color: '#333', flexWrap: 'wrap' }}>
            <span>
              <Box component="span" sx={{ display: 'inline-block', width: 16, height: 10, background: '#ff6b9d', borderRadius: 4, mr: 1, verticalAlign: 'middle' }} />
              Mujeres: {mujeres}
            </span>
            <span>
              <Box component="span" sx={{ display: 'inline-block', width: 16, height: 10, background: '#4ecdc4', borderRadius: 4, mr: 1, verticalAlign: 'middle' }} />
              Hombres: {hombres}
            </span>
            <span>
              <Box component="span" sx={{ display: 'inline-block', width: 16, height: 10, background: '#ffe66d', borderRadius: 4, mr: 1, verticalAlign: 'middle' }} />
              Otros: {otros}
            </span>
          </Box>
        </Box>

        <Box sx={{
          background: '#fff',
          p: 4,
          borderRadius: 3,
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
        }}>
          <Typography sx={{ color: '#9c1821', mb: 3, fontSize: { xs: '1rem', sm: '1.3rem' } }}>
            Top 10 Filiales con Más Voluntarios
          </Typography>
          <Box sx={{ height: { xs: 220, sm: 300 } }}>
            <Bar data={barData} options={barOptions} />
          </Box>
        </Box>
      </Box>

      {/* Estadísticas adicionales */}
      <Box sx={{
        background: '#fff',
        p: 4,
        borderRadius: 3,
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
      }}>
        <Typography sx={{ color: '#9c1821', mb: 3, fontSize: { xs: '1rem', sm: '1.3rem' } }}>
          Resumen General
        </Typography>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(auto-fit, minmax(200px, 1fr))' },
          gap: 3,
          mt: 3
        }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontSize: 42, fontWeight: 700, color: '#9c1821' }}>{promedioEdad}</Typography>
            <Typography sx={{ fontSize: 14, color: '#666', mt: 1 }}>Edad Promedio</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontSize: 42, fontWeight: 700, color: '#9c1821' }}>
              {total > 0 ? ((activos / total) * 100).toFixed(1) : 0}%
            </Typography>
            <Typography sx={{ fontSize: 14, color: '#666', mt: 1 }}>Tasa de Activos</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontSize: 42, fontWeight: 700, color: '#9c1821' }}>
              {totalFiliales > 0 ? Math.round(total / totalFiliales) : 0}
            </Typography>
            <Typography sx={{ fontSize: 14, color: '#666', mt: 1 }}>Voluntarios por Filial</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
