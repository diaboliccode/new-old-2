import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { UserPlus, Search, MoreVertical, Edit, Trash2, Blocks as Block, Star, X, Phone, Video, MessageCircle } from 'lucide-react';

export default function ContactManager({ 
  contacts, 
  onAddContact, 
  onEditContact, 
  onDeleteContact, 
  onBlockContact,
  onFavoriteContact 
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [showContactMenu, setShowContactMenu] = useState(null);
  const [newContact, setNewContact] = useState({
    username: '',
    avatar: '👤',
    phone: '',
    email: ''
  });

  const avatarOptions = ['👤', '👩‍💼', '👨‍💻', '👩‍🎨', '👨‍🔬', '👩‍⚕️', '👨‍🎓', '👩‍🚀', '🦸‍♂️', '🦸‍♀️'];

  const filteredContacts = contacts.filter(contact =>
    contact.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddContact = () => {
    if (!newContact.username.trim()) {
      toast({
        title: "Username Required",
        description: "Please enter a username for the contact",
        variant: "destructive"
      });
      return;
    }

    const contact = {
      id: `contact-${Date.now()}`,
      ...newContact,
      status: 'offline',
      lastSeen: new Date().toISOString(),
      isFavorite: false,
      isBlocked: false,
      createdAt: new Date().toISOString()
    };

    onAddContact(contact);
    setNewContact({ username: '', avatar: '👤', phone: '', email: '' });
    setShowAddForm(false);

    toast({
      title: "Contact Added! 👥",
      description: `${contact.username} has been added to your contacts`
    });
  };

  const handleContactAction = (action, contact) => {
    setShowContactMenu(null);
    
    switch (action) {
      case 'edit':
        setSelectedContact(contact);
        break;
      case 'delete':
        onDeleteContact(contact.id);
        toast({
          title: "Contact Deleted",
          description: `${contact.username} has been removed from your contacts`
        });
        break;
      case 'block':
        onBlockContact(contact.id);
        toast({
          title: contact.isBlocked ? "Contact Unblocked" : "Contact Blocked",
          description: `${contact.username} has been ${contact.isBlocked ? 'unblocked' : 'blocked'}`
        });
        break;
      case 'favorite':
        onFavoriteContact(contact.id);
        toast({
          title: contact.isFavorite ? "Removed from Favorites" : "Added to Favorites",
          description: `${contact.username} ${contact.isFavorite ? 'removed from' : 'added to'} favorites`
        });
        break;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Contact Management</h3>
        <Button onClick={() => setShowAddForm(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Add Contact
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search contacts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Contact List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredContacts.map((contact) => (
          <motion.div
            key={contact.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between p-3 bg-card border border-border rounded-lg hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-lg">
                  {contact.avatar}
                </div>
                {contact.isFavorite && (
                  <Star className="absolute -top-1 -right-1 w-4 h-4 text-yellow-500 fill-current" />
                )}
                {contact.isBlocked && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <Block className="w-2 h-2 text-white" />
                  </div>
                )}
              </div>
              
              <div>
                <h4 className="font-medium text-foreground">{contact.username}</h4>
                <p className="text-sm text-muted-foreground">
                  {contact.email || contact.phone || 'No contact info'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <MessageCircle className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <Phone className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <Video className="w-4 h-4" />
              </Button>
              
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8"
                  onClick={() => setShowContactMenu(showContactMenu === contact.id ? null : contact.id)}
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>

                {showContactMenu === contact.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg p-1 z-10 min-w-[120px]"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => handleContactAction('edit', contact)}
                    >
                      <Edit className="w-3 h-3 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => handleContactAction('favorite', contact)}
                    >
                      <Star className="w-3 h-3 mr-2" />
                      {contact.isFavorite ? 'Unfavorite' : 'Favorite'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => handleContactAction('block', contact)}
                    >
                      <Block className="w-3 h-3 mr-2" />
                      {contact.isBlocked ? 'Unblock' : 'Block'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-destructive"
                      onClick={() => handleContactAction('delete', contact)}
                    >
                      <Trash2 className="w-3 h-3 mr-2" />
                      Delete
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Contact Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-lg w-full max-w-md"
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="text-lg font-semibold">Add New Contact</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowAddForm(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="p-4 space-y-4">
                {/* Avatar Selection */}
                <div>
                  <Label>Avatar</Label>
                  <div className="grid grid-cols-5 gap-2 mt-2">
                    {avatarOptions.map((avatar) => (
                      <button
                        key={avatar}
                        className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-lg transition-colors ${
                          newContact.avatar === avatar ? 'border-primary bg-primary/20' : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setNewContact(prev => ({ ...prev, avatar }))}
                      >
                        {avatar}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Username */}
                <div>
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    value={newContact.username}
                    onChange={(e) => setNewContact(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="Enter username"
                  />
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                  />
                </div>

                {/* Phone */}
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={newContact.phone}
                    onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter phone number"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" className="flex-1" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                  <Button className="flex-1" onClick={handleAddContact}>
                    Add Contact
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}