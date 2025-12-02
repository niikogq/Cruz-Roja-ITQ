import React, { useEffect, useState } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';

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
    // Cargar voluntarios y filiales
    Promise.all([
      fetch('http://localhost:3001/api/voluntarios').then(res => res.json()),
      fetch('http://localhost:3001/api/filiales').then(res => res.json())
    ])
    .then(([voluntarios, filiales]) => {
      // Conteo de activos y llamada
      const nActivos = voluntarios.filter(v => v["Calidad de voluntario"] === 'Activo').length;
      const nLlamada = voluntarios.filter(v => v["Calidad de voluntario"] === 'Llamada').length;

      setActivos(nActivos);
      setLlamada(nLlamada);
      setTotal(voluntarios.length);
      setTotalFiliales(filiales.length);

      // NUEVO: Conteo de género
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

      // Contar voluntarios por filial (top 10)
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

      // Calcular promedio de edad
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

  // NUEVO: Gráfico de género
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
    <div style={{ padding: '32px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Tarjetas de estadísticas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 20,
        marginBottom: 40
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #9c1821 0%, #c54646 100%)',
          color: '#fff',
          padding: 24,
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(156, 24, 33, 0.3)'
        }}>
          <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>Total Voluntarios</div>
          <div style={{ fontSize: 36, fontWeight: 700 }}>{total}</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #38b000 0%, #4caf50 100%)',
          color: '#fff',
          padding: 24,
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(56, 176, 0, 0.3)'
        }}>
          <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>Voluntarios Activos</div>
          <div style={{ fontSize: 36, fontWeight: 700 }}>{activos}</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #f8c102 0%, #ffc107 100%)',
          color: '#fff',
          padding: 24,
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(248, 193, 2, 0.3)'
        }}>
          <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>Voluntarios de Llamada</div>
          <div style={{ fontSize: 36, fontWeight: 700 }}>{llamada}</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          color: '#fff',
          padding: 24,
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
        }}>
          <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>Total Filiales</div>
          <div style={{ fontSize: 36, fontWeight: 700 }}>{totalFiliales}</div>
        </div>
      </div>

      {/* Gráficos - AHORA 3 GRÁFICOS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: 24
      }}>
        {/* Gráfico de dona: Activos vs Llamada */}
        <div style={{
          background: '#fff',
          padding: 32,
          borderRadius: 16,
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#9c1821', marginBottom: 20, fontSize: '1.3rem' }}>
            Distribución de Voluntarios
          </h3>
          <div style={{ 
            width: '100%', 
            maxWidth: 280, 
            height: 280, 
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Doughnut data={doughnutData} />
          </div>
          <div style={{
            display: 'flex',
            gap: 32,
            marginTop: 24,
            fontSize: 16,
            fontWeight: 500,
            justifyContent: 'center',
            color: '#333'
          }}>
            <span>
              <span style={{
                display: 'inline-block', width: 16, height: 10,
                background: '#38b000', borderRadius: 4, marginRight: 8, verticalAlign: 'middle'
              }} />
              Activos: {activos}
            </span>
            <span>
              <span style={{
                display: 'inline-block', width: 16, height: 10,
                background: '#f8c102', borderRadius: 4, marginRight: 8, verticalAlign: 'middle'
              }} />
              Llamada: {llamada}
            </span>
          </div>
        </div>

        {/* NUEVO: Gráfico de género */}
        <div style={{
          background: '#fff',
          padding: 32,
          borderRadius: 16,
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#9c1821', marginBottom: 20, fontSize: '1.3rem' }}>
            Distribución por Género
          </h3>
          <div style={{ 
            width: '100%', 
            maxWidth: 280, 
            height: 280, 
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Doughnut data={generoData} />
          </div>
          <div style={{
            display: 'flex',
            gap: 24,
            marginTop: 24,
            fontSize: 16,
            fontWeight: 500,
            justifyContent: 'center',
            color: '#333',
            flexWrap: 'wrap'
          }}>
            <span>
              <span style={{
                display: 'inline-block', width: 16, height: 10,
                background: '#ff6b9d', borderRadius: 4, marginRight: 8, verticalAlign: 'middle'
              }} />
              Mujeres: {mujeres}
            </span>
            <span>
              <span style={{
                display: 'inline-block', width: 16, height: 10,
                background: '#4ecdc4', borderRadius: 4, marginRight: 8, verticalAlign: 'middle'
              }} />
              Hombres: {hombres}
            </span>
            <span>
              <span style={{
                display: 'inline-block', width: 16, height: 10,
                background: '#ffe66d', borderRadius: 4, marginRight: 8, verticalAlign: 'middle'
              }} />
              Otros: {otros}
            </span>
          </div>
        </div>

        {/* Gráfico de barras: Top 10 Filiales */}
        <div style={{
          background: '#fff',
          padding: 32,
          borderRadius: 16,
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#9c1821', marginBottom: 20, fontSize: '1.3rem' }}>
            Top 10 Filiales con Más Voluntarios
          </h3>
          <div style={{ height: 300 }}>
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </div>

      {/* Estadísticas adicionales - SIN CAMBIOS */}
      <div style={{
        background: '#fff',
        padding: 32,
        borderRadius: 16,
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        marginTop: 24
      }}>
        <h3 style={{ color: '#9c1821', marginBottom: 20, fontSize: '1.3rem' }}>
          Resumen General
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 24,
          marginTop: 20
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 42, fontWeight: 700, color: '#9c1821' }}>{promedioEdad}</div>
            <div style={{ fontSize: 14, color: '#666', marginTop: 8 }}>Edad Promedio</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 42, fontWeight: 700, color: '#9c1821' }}>
              {total > 0 ? ((activos / total) * 100).toFixed(1) : 0}%
            </div>
            <div style={{ fontSize: 14, color: '#666', marginTop: 8 }}>Tasa de Activos</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 42, fontWeight: 700, color: '#9c1821' }}>
              {totalFiliales > 0 ? Math.round(total / totalFiliales) : 0}
            </div>
            <div style={{ fontSize: 14, color: '#666', marginTop: 8 }}>Voluntarios por Filial</div>
          </div>
        </div>
      </div>
    </div>
  );
}
