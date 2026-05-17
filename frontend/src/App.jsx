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
// AUTO ZOOM
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
// FIX MOBILE MAP
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
// APP
// ---------------------------------------------------

function App() {

  const [days, setDays] = useState([])
  const [teams, setTeams] = useState([])
  const [villages, setVillages] = useState([])

  const [selectedDay, setSelectedDay] = useState('')
  const [selectedTeam, setSelectedTeam] = useState('')
  const [selectedVillage, setSelectedVillage] = useState('All')

  const [farmers, setFarmers] = useState([])
  const [route, setRoute] = useState(null)

  const [completedFarmers, setCompletedFarmers] = useState([])

  const [showMap, setShowMap] = useState(false)

  // ---------------------------------------------------
  // LOAD DAYS
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
  // LOAD VILLAGES
  // ---------------------------------------------------

  useEffect(() => {

    if (!selectedDay || !selectedTeam) return

    axios.get(
      `https://farm-field-dashboard.onrender.com/villages/${selectedDay}/${selectedTeam}`
    )
      .then(res => setVillages(res.data))
      .catch(err => console.log(err))

  }, [selectedDay, selectedTeam])

  // ---------------------------------------------------
  // LOAD FARMERS + ROUTE
  // ---------------------------------------------------

  useEffect(() => {

    if (!selectedDay || !selectedTeam) return

    axios.get(
      `https://farm-field-dashboard.onrender.com/farmers/${selectedDay}/${selectedTeam}?village=${selectedVillage}`
    )
      .then(res => setFarmers(res.data))
      .catch(err => console.log(err))

    axios.get(
      `https://farm-field-dashboard.onrender.com/route/${selectedDay}/${selectedTeam}`
    )
      .then(res => setRoute(res.data))
      .catch(err => console.log(err))

  }, [selectedDay, selectedTeam, selectedVillage])

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
          padding: '20px'
        }}
      >

        <h1>
          🌿 Farm Field Dashboard
        </h1>

      </div>

      {/* FILTERS */}

      <div
        style={{
          background: 'white',
          padding: '15px',
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap'
        }}
      >

        {/* DATE */}

        <select
          value={selectedDay}
          onChange={(e) => {

            setSelectedDay(e.target.value)

            setSelectedTeam('')

            setSelectedVillage('All')

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
          onChange={(e) =>
            setSelectedTeam(e.target.value)
          }
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

        {/* VILLAGE */}

        <select
          value={selectedVillage}
          onChange={(e) =>
            setSelectedVillage(e.target.value)
          }
        >

          <option value='All'>
            All Villages
          </option>

          {
            villages.map(village => (

              <option
                key={village}
                value={village}
              >
                {village}
              </option>

            ))
          }

        </select>

      </div>

      {/* COUNTS */}

      <div
        style={{
          display: 'flex',
          gap: '15px',
          padding: '20px'
        }}
      >

        <div>
          ✅ Completed: {completedCount}
        </div>

        <div>
          ⏳ Pending: {pendingCount}
        </div>

      </div>

      {/* MAIN */}

      <div
        style={{
          display: 'grid',

          gridTemplateColumns:
            window.innerWidth < 768
              ? '1fr'
              : '350px 1fr',

          gap: '20px',
          padding: '20px'
        }}
      >

        {/* FARMERS */}

        <div>

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
                    background: 'white',
                    padding: '15px',
                    borderRadius: '12px',
                    marginBottom: '10px'
                  }}
                >

                  <h3>
                    {farmer['Bp Number farms']}
                  </h3>

                  <p>
                    👨‍🌾 {farmer['Farmer Name']}
                  </p>

                  <p>
                    📍 {farmer['Village']}
                  </p>

                  <p>
                    📞 {farmer['Phone Number']}
                  </p>

                  <a
                    href={`https://www.google.com/maps?q=${farmer.Lat},${farmer.Long}`}
                    target='_blank'
                    rel='noreferrer'
                  >
                    Open Location
                  </a>

                  <br />
                  <br />

                  {
                    !isCompleted &&

                    <button
                      onClick={() =>
                        completeFarmer(
                          farmer['Bp Number farms']
                        )
                      }
                    >
                      ✅ Complete
                    </button>
                  }

                  {
                    isCompleted &&

                    <button
                      onClick={() =>
                        undoComplete(
                          farmer['Bp Number farms']
                        )
                      }
                    >
                      ↩ Undo
                    </button>
                  }

                </div>

              )

            })
          }

        </div>

        {/* MAP */}

        <div>

          <button
            onClick={() =>
              setShowMap(!showMap)
            }
          >
            {
              showMap
                ? 'Close Map'
                : 'Open Map'
            }
          </button>

          <br />
          <br />

          {
            showMap &&

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

                      <div>

                        <h3>
                          {farmer['Bp Number farms']}
                        </h3>

                        <p>
                          {farmer['Farmer Name']}
                        </p>

                        <p>
                          {farmer['Village']}
                        </p>

                        <p>
                          {farmer['Phone Number']}
                        </p>

                      </div>

                    </Popup>

                  </Marker>

                ))
              }

            </MapContainer>
          }

        </div>

      </div>

    </div>
  )
}

export default App