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
// FIX MOBILE MAP RESIZE
// ---------------------------------------------------

function FixMapResize() {

  const map = useMap()

  useEffect(() => {

    setTimeout(() => {

      map.invalidateSize()

    }, 500)

  }, [map])

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

  const [showMap, setShowMap] = useState(false)

  // ---------------------------------------------------
  // LOAD DATES
  // ---------------------------------------------------

  useEffect(() => {

    axios.get(
      'https://farm-field-dashboard.onrender.com/days'
    )
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

        {/* DATE */}

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
            Select Date
          </option>

          {
            days.map(day => (

              <option
                key={day}
                value={day}
              >
                {day}
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

          gridTemplateColumns:
            window.innerWidth < 768
              ? '1fr'
              : '380px 1fr',

          gap: '20px',
          padding: '20px'
        }}
      >

        {/* LEFT PANEL */}

        <div
          style={{
            background: 'white',
            borderRadius: '18px',
            padding: '18px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.08)'
          }}
        >

          <h2
            style={{
              marginTop: 0,
              marginBottom: '18px',
              fontSize: '32px',
              fontWeight: '800'
            }}
          >
            📋 Assigned Farmers
          </h2>

          {/* VILLAGES INCLUDED */}

          {
            farmers.length > 0 &&

            <div
              style={{
                marginBottom: '18px',
                padding: '14px',
                background: '#f1f5f3',
                borderRadius: '14px',
                fontSize: '13px',
                color: '#444',
                lineHeight: '1.7'
              }}
            >

              <strong>
                Villages Included:
              </strong>

              <br />

              {
                [...new Set(
                  farmers.map(f => f['Village'])
                )].join(', ')
              }

            </div>
          }

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
                      : '1px solid #e9ecef',

                    borderRadius: '18px',

                    padding: '16px',

                    marginBottom: '14px',

                    background: '#ffffff',

                    boxShadow: '0 4px 14px rgba(0,0,0,0.06)'
                  }}
                >

                  {/* TOP */}

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '10px'
                    }}
                  >

                    {/* LEFT */}

                    <div
                      style={{
                        flex: 1
                      }}
                    >

                      {/* BP NUMBER */}

                      <div
                        style={{
                          fontWeight: '800',
                          color: '#1b4332',
                          fontSize: '17px',
                          lineHeight: '1.4',
                          wordBreak: 'break-word'
                        }}
                      >
                        {farmer['Bp Number farms']}
                      </div>

                      {/* FARMER NAME */}

                      <div
                        style={{
                          marginTop: '6px',
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#222'
                        }}
                      >
                        {farmer['Farmer Name']}
                      </div>

                      {/* PHONE */}

                      <a
                        href={`tel:${farmer['Phone Number']}`}
                        style={{
                          marginTop: '8px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: '#444',
                          textDecoration: 'none',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}
                      >
                        📞 {farmer['Phone Number']}
                      </a>

                      {/* VILLAGE */}

                      <div
                        style={{
                          marginTop: '8px',
                          fontSize: '13px',
                          color: '#666',
                          fontWeight: '500'
                        }}
                      >
                        📍 {farmer['Village']}
                      </div>

                    </div>

                    {/* LOCATION BUTTON */}

                    <a
                      href={`https://www.google.com/maps?q=${farmer.Lat},${farmer.Long}`}
                      target='_blank'
                      rel='noreferrer'
                      style={{
                        background: '#e9f5ee',

                        minWidth: '52px',
                        height: '52px',

                        borderRadius: '14px',

                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',

                        textDecoration: 'none',

                        fontSize: '24px',

                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                      }}
                      title='Open Location'
                    >
                      📍
                    </a>

                  </div>

                  {/* COMPLETE SECTION */}

                  <div
                    style={{
                      marginTop: '16px'
                    }}
                  >

                    {
                      !isCompleted &&

                      <button
                        onClick={() =>
                          completeFarmer(
                            farmer['Bp Number farms']
                          )
                        }
                        style={{
                          background: '#2d6a4f',

                          color: 'white',

                          border: 'none',

                          padding: '12px 18px',

                          borderRadius: '12px',

                          cursor: 'pointer',

                          fontWeight: '700',

                          fontSize: '14px',

                          width: '100%'
                        }}
                      >
                        ✅ Mark Complete
                      </button>
                    }

                    {
                      isCompleted &&

                      <div>

                        <div
                          style={{
                            color: '#2d6a4f',

                            fontWeight: '700',

                            marginBottom: '10px',

                            textAlign: 'center'
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

                            padding: '12px 18px',

                            borderRadius: '12px',

                            cursor: 'pointer',

                            fontWeight: '700',

                            fontSize: '14px',

                            width: '100%'
                          }}
                        >
                          ↩ Undo Completion
                        </button>

                      </div>
                    }

                  </div>

                </div>

              )

            })
          }

        </div>

        {/* MAP SECTION */}

        <div>

          <button
            onClick={() => setShowMap(!showMap)}
            style={{
              background: '#1d3557',
              color: 'white',
              border: 'none',
              padding: '14px 20px',
              borderRadius: '12px',
              cursor: 'pointer',
              marginBottom: '15px',
              fontWeight: '600',
              width: '100%'
            }}
          >
            {
              showMap
                ? '❌ Close Map'
                : '🗺 Open Map'
            }
          </button>

          {
            showMap &&

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

                <FixMapResize />

                <TileLayer
                  attribution='Google Hybrid'
                  url='https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
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
          }

        </div>

      </div>

    </div>
  )
}

export default App