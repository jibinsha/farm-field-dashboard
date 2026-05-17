import { useEffect, useState } from 'react'
import axios from 'axios'

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap
} from 'react-leaflet'

import 'leaflet/dist/leaflet.css'

// ---------------------------------------------------
// AUTO ZOOM COMPONENT
// ---------------------------------------------------

function ZoomToFarmers({ farmers }) {

  const map = useMap()

  useEffect(() => {

    if (!farmers || farmers.length === 0) return

    const bounds = farmers.map(farmer => [
      farmer.Lat,
      farmer.Long
    ])

    map.fitBounds(bounds, {
      padding: [50, 50]
    })

  }, [farmers, map])

  return null
}

// ---------------------------------------------------
// MAIN APP
// ---------------------------------------------------

function App() {

  const [days, setDays] = useState([])
  const [teams, setTeams] = useState([])

  const [selectedDay, setSelectedDay] = useState('')
  const [selectedTeam, setSelectedTeam] = useState('')

  const [farmers, setFarmers] = useState([])
  const [route, setRoute] = useState(null)

  const [completedFarmers, setCompletedFarmers] = useState([])

  // ---------------------------------------------------
  // LOAD DAYS
  // ---------------------------------------------------

  useEffect(() => {

    axios.get('https://farm-field-dashboard.onrender.com/days')
      .then(res => setDays(res.data))
      .catch(err => console.log(err))

  }, [])

  // ---------------------------------------------------
  // LOAD TEAMS
  // ---------------------------------------------------

  useEffect(() => {

    if (!selectedDay) return

    axios.get(
      `https://farm-field-dashboard.onrender.com/teams/${selectedDay}`
    )
      .then(res => setTeams(res.data))
      .catch(err => console.log(err))

  }, [selectedDay])

  // ---------------------------------------------------
  // LOAD FARMERS + ROUTE
  // ---------------------------------------------------

  useEffect(() => {

    if (!selectedDay || !selectedTeam) return

    axios.get(
      `https://farm-field-dashboard.onrender.com/farmers/${selectedDay}/${selectedTeam}`
    )
      .then(res => setFarmers(res.data))
      .catch(err => console.log(err))

    axios.get(
      `https://farm-field-dashboard.onrender.com/route/${selectedDay}/${selectedTeam}`
    )
      .then(res => setRoute(res.data))
      .catch(err => console.log(err))

  }, [selectedDay, selectedTeam])

  // ---------------------------------------------------
  // LOAD PROGRESS
  // ---------------------------------------------------

  const loadProgress = async () => {

    try {

      const res = await axios.get(
        'https://farm-field-dashboard.onrender.com/progress'
      )

      const completed = res.data.map(
        item => item['Bp Number farms']
      )

      setCompletedFarmers(completed)

    } catch (error) {

      console.log(error)

    }

  }

  useEffect(() => {

    loadProgress()

  }, [])

  // ---------------------------------------------------
  // COMPLETE FARMER
  // ---------------------------------------------------

  const completeFarmer = async (bpNumber) => {

    try {

      await axios.post(
        `https://farm-field-dashboard.onrender.com/complete/${bpNumber}`
      )

      loadProgress()

    } catch (error) {

      console.log(error)

    }

  }

  // ---------------------------------------------------
  // UNDO COMPLETE
  // ---------------------------------------------------

  const undoComplete = async (bpNumber) => {

    try {

      await axios.post(
        `https://farm-field-dashboard.onrender.com/undo/${bpNumber}`
      )

      loadProgress()

    } catch (error) {

      console.log(error)

    }

  }

  // ---------------------------------------------------
  // COUNTS
  // ---------------------------------------------------

  const completedCount = farmers.filter(farmer =>
    completedFarmers.includes(
      farmer['Bp Number farms']
    )
  ).length

  const pendingCount =
    farmers.length - completedCount

  return (

    <div
      style={{
        minHeight: '100vh',
        background: '#f3f6f4',
        fontFamily: 'Inter, Arial, sans-serif'
      }}
    >

      {/* HEADER */}

      <div
        style={{
          background: '#1b4332',
          color: 'white',
          padding: '20px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}
      >

        <h1
          style={{
            margin: 0,
            fontSize: '28px'
          }}
        >
          🌿 Farm Field Dashboard
        </h1>

        <p
          style={{
            marginTop: '6px',
            opacity: 0.9
          }}
        >
          Smart team routing and farmer management
        </p>

      </div>

      {/* FILTER BAR */}

      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          background: 'white',
          padding: '15px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}
      >

        {/* DAY */}

        <select
          value={selectedDay}
          onChange={(e) => {

            setSelectedDay(e.target.value)
            setSelectedTeam('')
            setFarmers([])
            setRoute(null)

          }}
          style={{
            padding: '12px',
            borderRadius: '10px',
            border: '1px solid #dcdcdc',
            minWidth: '150px',
            fontSize: '15px',
            background: '#fafafa'
          }}
        >

          <option value=''>
            Select Day
          </option>

          {
            days.map(day => (

              <option
                key={day}
                value={day}
              >
                Day {day}
              </option>

            ))
          }

        </select>

        {/* TEAM */}

        <select
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          style={{
            padding: '12px',
            borderRadius: '10px',
            border: '1px solid #dcdcdc',
            minWidth: '150px',
            fontSize: '15px',
            background: '#fafafa'
          }}
        >

          <option value=''>
            Select Team
          </option>

          {
            teams.map(team => (

              <option
                key={team}
                value={team}
              >
                {team}
              </option>

            ))
          }

        </select>

        {/* ROUTE BUTTON */}

        {
          route &&
          route.Route_Link &&

          <a
            href={route.Route_Link}
            target='_blank'
            rel='noreferrer'
            style={{
              background: '#2d6a4f',
              color: 'white',
              padding: '12px 20px',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: '600'
            }}
          >
            🚗 Open Route
          </a>
        }

        {/* DOWNLOAD REPORT */}

        <a
          href="https://farm-field-dashboard.onrender.com/download-report"
          target="_blank"
          rel="noreferrer"
          style={{
            background: '#1d3557',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '10px',
            textDecoration: 'none',
            fontWeight: '600'
          }}
        >
          📥 Download Report
        </a>

      </div>

      {/* PROGRESS CARDS */}

      <div
        style={{
          display: 'flex',
          gap: '15px',
          padding: '20px',
          flexWrap: 'wrap'
        }}
      >

        <div
          style={{
            background: '#d8f3dc',
            padding: '15px',
            borderRadius: '12px',
            minWidth: '180px'
          }}
        >
          <h3>✅ Completed</h3>

          <h1>{completedCount}</h1>
        </div>

        <div
          style={{
            background: '#ffe5d9',
            padding: '15px',
            borderRadius: '12px',
            minWidth: '180px'
          }}
        >
          <h3>⏳ Pending</h3>

          <h1>{pendingCount}</h1>
        </div>

      </div>

      {/* MAIN CONTENT */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '350px 1fr',
          gap: '20px',
          padding: '20px'
        }}
      >

        {/* LEFT PANEL */}

        <div
          style={{
            background: 'white',
            borderRadius: '16px',
            padding: '16px',
            height: '80vh',
            overflowY: 'auto',
            boxShadow: '0 4px 14px rgba(0,0,0,0.08)'
          }}
        >

          <h2
            style={{
              marginTop: 0,
              marginBottom: '20px'
            }}
          >
            📋 Assigned Farmers
          </h2>

          {
            farmers.length === 0 &&
            <p>No farmers loaded</p>
          }

          {
            farmers.map((farmer, index) => {

              const isCompleted =
                completedFarmers.includes(
                  farmer['Bp Number farms']
                )

              return (

                <div
                  key={index}
                  style={{
                    border: isCompleted
                      ? '2px solid #2d6a4f'
                      : '1px solid #ececec',

                    borderRadius: '14px',
                    padding: '14px',
                    marginBottom: '12px',

                    background: isCompleted
                      ? '#e9f5ee'
                      : '#fafafa',

                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >

                  {/* LEFT */}

                  <div>

                    <div
                      style={{
                        fontWeight: '700',
                        color: '#1b4332',
                        fontSize: '15px'
                      }}
                    >
                      {farmer['Bp Number farms']}
                    </div>

                    <div
                      style={{
                        marginTop: '5px',
                        fontSize: '14px'
                      }}
                    >
                      {farmer['Farmer Name']}
                    </div>

                    <div
                      style={{
                        marginTop: '5px',
                        fontSize: '12px',
                        color: '#666'
                      }}
                    >
                      {farmer.Lat}, {farmer.Long}
                    </div>

                    {/* COMPLETE BUTTON */}

                    {
                      !isCompleted &&

                      <button
                        onClick={() =>
                          completeFarmer(
                            farmer['Bp Number farms']
                          )
                        }
                        style={{
                          marginTop: '10px',
                          background: '#2d6a4f',
                          color: 'white',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          cursor: 'pointer'
                        }}
                      >
                        ✅ Complete
                      </button>
                    }

                    {/* COMPLETED + UNDO */}

                    {
                      isCompleted &&

                      <div
                        style={{
                          marginTop: '10px'
                        }}
                      >

                        <div
                          style={{
                            color: '#2d6a4f',
                            fontWeight: 'bold',
                            marginBottom: '8px'
                          }}
                        >
                          ✔ Completed
                        </div>

                        <button
                          onClick={() =>
                            undoComplete(
                              farmer['Bp Number farms']
                            )
                          }
                          style={{
                            background: '#c1121f',
                            color: 'white',
                            border: 'none',
                            padding: '7px 12px',
                            borderRadius: '8px',
                            cursor: 'pointer'
                          }}
                        >
                          ↩ Undo
                        </button>

                      </div>
                    }

                  </div>

                  {/* LOCATION BUTTON */}

                  <a
                    href={`https://www.google.com/maps?q=${farmer.Lat},${farmer.Long}`}
                    target='_blank'
                    rel='noreferrer'
                    style={{
                      background: '#e9f5ee',
                      borderRadius: '12px',
                      width: '44px',
                      height: '44px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      textDecoration: 'none',
                      fontSize: '20px'
                    }}
                    title='Open Location'
                  >
                    🧭
                  </a>

                </div>

              )

            })
          }

        </div>

        {/* MAP */}

        <div
          style={{
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 4px 14px rgba(0,0,0,0.08)'
          }}
        >

          <MapContainer
            center={[12.2958, 75.6433]}
            zoom={10}
            style={{
              height: '80vh',
              width: '100%'
            }}
          >

            <ZoomToFarmers farmers={farmers} />

            <TileLayer
              attribution='OpenStreetMap'
              url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            />

            {
              farmers.map((farmer, index) => (

                <Marker
                  key={index}
                  position={[
                    farmer.Lat,
                    farmer.Long
                  ]}
                >

                  <Popup>

                    <div style={{ minWidth: '250px' }}>

                      <h3>
                        {farmer['Bp Number farms']}
                      </h3>

                      <hr />

                      {
                        Object.entries(farmer).map(([key, value]) => (

                          <p key={key}>

                            <strong>
                              {key}:
                            </strong>

                            {' '}

                            {String(value)}

                          </p>

                        ))
                      }

                    </div>

                  </Popup>

                </Marker>

              ))
            }

          </MapContainer>

        </div>

      </div>

    </div>
  )
}

export default App