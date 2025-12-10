import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

/**
 * Hook pour gérer les zones de livraison - A4.3
 */
export function useDeliveryZones() {
  const [zones, setZones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchZones = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('delivery_zones')
        .select('*')
        .order('name')

      if (fetchError) throw fetchError

      setZones(data || [])
    } catch (err) {
      console.error('Error fetching delivery zones:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchZones()
  }, [])

  const createZone = async (zoneData) => {
    try {
      const { data, error: createError } = await supabase
        .from('delivery_zones')
        .insert([zoneData])
        .select()
        .single()

      if (createError) throw createError

      await fetchZones()
      return { data, error: null }
    } catch (err) {
      console.error('Error creating zone:', err)
      return { data: null, error: err.message }
    }
  }

  const updateZone = async (zoneId, zoneData) => {
    try {
      const { data, error: updateError } = await supabase
        .from('delivery_zones')
        .update({ ...zoneData, updated_at: new Date().toISOString() })
        .eq('id', zoneId)
        .select()
        .single()

      if (updateError) throw updateError

      await fetchZones()
      return { data, error: null }
    } catch (err) {
      console.error('Error updating zone:', err)
      return { data: null, error: err.message }
    }
  }

  const deleteZone = async (zoneId) => {
    try {
      const { error: deleteError } = await supabase
        .from('delivery_zones')
        .delete()
        .eq('id', zoneId)

      if (deleteError) throw deleteError

      await fetchZones()
      return { error: null }
    } catch (err) {
      console.error('Error deleting zone:', err)
      return { error: err.message }
    }
  }

  const toggleZoneActive = async (zoneId, isActive) => {
    try {
      const { error: toggleError } = await supabase
        .from('delivery_zones')
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq('id', zoneId)

      if (toggleError) throw toggleError

      await fetchZones()
      return { error: null }
    } catch (err) {
      console.error('Error toggling zone:', err)
      return { error: err.message }
    }
  }

  return {
    zones,
    loading,
    error,
    refetch: fetchZones,
    createZone,
    updateZone,
    deleteZone,
    toggleZoneActive
  }
}

/**
 * Hook pour gérer les créneaux horaires de livraison - A4.2
 */
export function useDeliverySlots() {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchSlots = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('delivery_slots')
        .select('*')
        .order('day_of_week')
        .order('start_time')

      if (fetchError) throw fetchError

      setSlots(data || [])
    } catch (err) {
      console.error('Error fetching delivery slots:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSlots()
  }, [])

  const createSlot = async (slotData) => {
    try {
      const { data, error: createError } = await supabase
        .from('delivery_slots')
        .insert([slotData])
        .select()
        .single()

      if (createError) throw createError

      await fetchSlots()
      return { data, error: null }
    } catch (err) {
      console.error('Error creating slot:', err)
      return { data: null, error: err.message }
    }
  }

  const updateSlot = async (slotId, slotData) => {
    try {
      const { data, error: updateError } = await supabase
        .from('delivery_slots')
        .update({ ...slotData, updated_at: new Date().toISOString() })
        .eq('id', slotId)
        .select()
        .single()

      if (updateError) throw updateError

      await fetchSlots()
      return { data, error: null }
    } catch (err) {
      console.error('Error updating slot:', err)
      return { data: null, error: err.message }
    }
  }

  const deleteSlot = async (slotId) => {
    try {
      const { error: deleteError } = await supabase
        .from('delivery_slots')
        .delete()
        .eq('id', slotId)

      if (deleteError) throw deleteError

      await fetchSlots()
      return { error: null }
    } catch (err) {
      console.error('Error deleting slot:', err)
      return { error: err.message }
    }
  }

  const toggleSlotActive = async (slotId, isActive) => {
    try {
      const { error: toggleError } = await supabase
        .from('delivery_slots')
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq('id', slotId)

      if (toggleError) throw toggleError

      await fetchSlots()
      return { error: null }
    } catch (err) {
      console.error('Error toggling slot:', err)
      return { error: err.message }
    }
  }

  return {
    slots,
    loading,
    error,
    refetch: fetchSlots,
    createSlot,
    updateSlot,
    deleteSlot,
    toggleSlotActive
  }
}

/**
 * Hook pour gérer les tournées de livraison - A4.1
 */
export function useDeliveryRoutes() {
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchRoutes = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('delivery_routes')
        .select(`
          *,
          delivery_slots (*),
          delivery_zones (*)
        `)
        .order('delivery_date', { ascending: false })
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setRoutes(data || [])
    } catch (err) {
      console.error('Error fetching delivery routes:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRoutes()
  }, [])

  const createRoute = async (routeData) => {
    try {
      const { data, error: createError } = await supabase
        .from('delivery_routes')
        .insert([routeData])
        .select()
        .single()

      if (createError) throw createError

      await fetchRoutes()
      return { data, error: null }
    } catch (err) {
      console.error('Error creating route:', err)
      return { data: null, error: err.message }
    }
  }

  const updateRoute = async (routeId, routeData) => {
    try {
      const { data, error: updateError } = await supabase
        .from('delivery_routes')
        .update({ ...routeData, updated_at: new Date().toISOString() })
        .eq('id', routeId)
        .select()
        .single()

      if (updateError) throw updateError

      await fetchRoutes()
      return { data, error: null }
    } catch (err) {
      console.error('Error updating route:', err)
      return { data: null, error: err.message }
    }
  }

  const deleteRoute = async (routeId) => {
    try {
      const { error: deleteError } = await supabase
        .from('delivery_routes')
        .delete()
        .eq('id', routeId)

      if (deleteError) throw deleteError

      await fetchRoutes()
      return { error: null }
    } catch (err) {
      console.error('Error deleting route:', err)
      return { error: err.message }
    }
  }

  return {
    routes,
    loading,
    error,
    refetch: fetchRoutes,
    createRoute,
    updateRoute,
    deleteRoute
  }
}

// Helper pour formater les jours de la semaine
export const getDayName = (dayOfWeek) => {
  const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
  return days[dayOfWeek] || ''
}

// Helper pour formater les horaires
export const formatTime = (time) => {
  if (!time) return ''
  return time.substring(0, 5) // "HH:MM"
}
